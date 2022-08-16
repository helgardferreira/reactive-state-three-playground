import * as THREE from "three";
import { delay, merge, Observable, Subject, Subscription } from "rxjs";

import eventBus from "../EventBus";
import { RaycastEvent } from "../events/RaycastEvent";

// Maybe work on mousePointer immutability
// Maybe add an xState machine
export class Raycaster {
  private _raycaster = new THREE.Raycaster();
  private _mousePointer = new THREE.Vector2();

  private _moveSub: Subscription;
  private _dragendSub: Subscription;

  public raycast$: Subject<RaycastEvent> = new Subject();

  constructor(private _camera: THREE.PerspectiveCamera) {
    this.resetMousePointer();

    this._moveSub = merge(
      eventBus.ofType<PointerEvent>("pointermove"),
      eventBus.ofType<DragEvent>("drag")
    ).subscribe(this.movePointer);

    this._dragendSub = eventBus
      .ofType<DragEvent>("dragend")
      .pipe(delay(10))
      .subscribe(this.resetMousePointer);

    eventBus.trigger(this.raycast$);
  }

  private resetMousePointer = () => {
    this._mousePointer.set(-1000, -1000);
  };

  private movePointer = (event: DragEvent | PointerEvent) => {
    this._mousePointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    this._mousePointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  };

  public update = (objects: THREE.Object3D<THREE.Event>[]) => {
    this._raycaster.setFromCamera(this._mousePointer, this._camera);
    const intersects = this._raycaster.intersectObjects(objects);
    this.raycast$.next(
      new RaycastEvent({
        mousePointer: this._mousePointer,
        intersects,
      })
    );
  };

  public dispose = () => {
    this._moveSub.unsubscribe();
    this._dragendSub.unsubscribe();
  };
}
