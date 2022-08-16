import { Subscription } from "rxjs";
import { set } from "lodash";
import { withLatestFrom } from "rxjs/operators";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { DEG2RAD } from "three/src/math/MathUtils";
import eventBus from "../EventBus";
import { RaycastEvent } from "../events/RaycastEvent";
import { TextureLoadEventData } from "../events/TextureLoadEvent";
import { UpdateTextureEvent } from "../events/UpdateTextureEvent";
import textureLoader from "./loaders/TextureLoader";
import { Raycaster } from "./Raycaster";

export class Viewer {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private textureMap: Map<string, TextureLoadEventData> = new Map();
  private raycaster: Raycaster;
  private subscriptions: Subscription[] = [];

  constructor() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 8);

    this.raycaster = new Raycaster(this.camera);

    // Create and attach controls
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    // this.controls.autoRotate = true;

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.init();

    this.render();
  }

  get canvas() {
    return this.renderer.domElement;
  }

  private loadTextures = () => {
    const artisticTexture = textureLoader.load({
      basecolor: import("../assets/textures/artistic-tile/basecolor.jpg"),
      ambientOcclusion: import(
        "../assets/textures/artistic-tile/ambientOcclusion.jpg"
      ),
      height: import("../assets/textures/artistic-tile/height.png"),
      metallic: import("../assets/textures/artistic-tile/metallic.jpg"),
      normal: import("../assets/textures/artistic-tile/normal.jpg"),
      roughness: import("../assets/textures/artistic-tile/roughness.jpg"),
    });

    this.subscriptions.push(
      artisticTexture.subscribe(({ data }) => {
        this.textureMap.set(data.map.image.src, data);
      })
    );
  };

  private createObjects = () => {
    const objects = [];

    const textureMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    textureMaterial.side = THREE.FrontSide;

    const defaultMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    defaultMaterial.side = THREE.BackSide;

    const planeSize = 4;

    const planeGeometry = new THREE.PlaneGeometry(planeSize, planeSize, 1, 1);

    const leftWall = new THREE.Group();
    const rightWall = new THREE.Group();
    const floor = new THREE.Group();

    leftWall.add(
      new THREE.Mesh(planeGeometry, textureMaterial),
      new THREE.Mesh(planeGeometry, defaultMaterial)
    );
    rightWall.add(
      new THREE.Mesh(planeGeometry, textureMaterial.clone()),
      new THREE.Mesh(planeGeometry, defaultMaterial)
    );
    floor.add(
      new THREE.Mesh(planeGeometry, textureMaterial.clone()),
      new THREE.Mesh(planeGeometry, defaultMaterial)
    );

    leftWall.rotateY(45 * DEG2RAD);
    rightWall.rotateY(-45 * DEG2RAD);
    floor.rotateX(-90 * DEG2RAD);
    floor.rotateZ(45 * DEG2RAD);

    const distance = (Math.cos(Math.PI / 4) * planeSize) / 2;

    leftWall.position.set(-distance, 0, 0);
    rightWall.position.set(distance, 0, 0);
    floor.position.set(0, -planeSize / 2, distance);
    const walls = new THREE.Group();

    walls.add(leftWall, rightWall);

    objects.push(walls, floor);
    return objects;
  };

  private createLights = () => {
    const lights = [];

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    const pointLight = new THREE.PointLight(0xffffff, 0.7);
    pointLight.position
      .copy(this.camera.position)
      .add(new THREE.Vector3(0, 3, 0));

    lights.push(ambientLight, pointLight);
    return lights;
  };

  private init = () => {
    this.loadTextures();
    const objects = this.createObjects();
    const lights = this.createLights();

    this.scene.add(...objects, ...lights);

    this.addEventListeners();
  };

  private addEventListeners = () => {
    this.subscriptions.push(
      eventBus.ofType("resize").subscribe(this.resizeCanvas),
      eventBus
        .ofType<UpdateTextureEvent>("updateTexture")
        .pipe(withLatestFrom(this.raycaster.raycast$))
        .subscribe(this.updateTexture)
    );
  };

  private removeEventListeners = () => {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  };

  private resizeCanvas = () => {
    // Update camera
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    // Update renderer
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  };

  private render = () => {
    this.renderer.render(this.scene, this.camera);
    this.raycaster.update(this.scene.children);

    // required if controls.enableDamping or controls.autoRotate are set to true
    this.controls.update();

    requestAnimationFrame(this.render);
  };

  private hasStandardMaterialMesh = (
    object: THREE.Object3D
  ): object is THREE.Mesh<any, THREE.MeshStandardMaterial> => {
    return (
      (object as THREE.Mesh<any, THREE.MeshStandardMaterial>)
        .material instanceof THREE.MeshStandardMaterial
    );
  };

  public updateTexture = ([updateTextureEvent, raycastEvent]: [
    UpdateTextureEvent,
    RaycastEvent
  ]) => {
    const texture = this.textureMap.get(updateTextureEvent.data);

    const intersectedObject = raycastEvent.data.intersects[0]?.object;
    if (intersectedObject) {
      if (texture && this.hasStandardMaterialMesh(intersectedObject)) {
        const material = intersectedObject.material;
        set(material, "map", texture.map);
        if (texture.aoMap) set(material, "aoMap", texture.aoMap);
        // if (texture.displacementMap)
        //   set(material, "displacementMap", texture.displacementMap);
        if (texture.metalnessMap)
          set(material, "metalnessMap", texture.metalnessMap);
        if (texture.roughnessMap)
          set(material, "roughnessMap", texture.roughnessMap);
        if (texture.normalMap) set(material, "normalMap", texture.normalMap);

        intersectedObject.material.needsUpdate = true;
      }
    }
  };

  public dispose = () => {
    this.renderer.dispose();
    this.controls.dispose();

    this.removeEventListeners();
  };
}

const viewer = new Viewer();

export default viewer;
