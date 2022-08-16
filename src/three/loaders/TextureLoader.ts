import * as THREE from "three";
import { Observable, from, merge, noop, EMPTY, concat, zip } from "rxjs";
import { map, mergeAll, mergeMap, mergeWith, tap } from "rxjs/operators";

import eventBus from "../../EventBus";
import { IEvent } from "../../utils/types";
import {
  TextureLoadEvent,
  TextureLoadEventData,
} from "../../events/TextureLoadEvent";

type ImageImportPromise = Promise<
  typeof import("*.jpg") | typeof import("*.png")
>;

interface TextureLoaderData {
  basecolor: string | ImageImportPromise;
  ambientOcclusion?: string | ImageImportPromise;
  height?: string | ImageImportPromise;
  metallic?: string | ImageImportPromise;
  normal?: string | ImageImportPromise;
  roughness?: string | ImageImportPromise;
}

// TODO: implement state machine for TextureLoader
export class TextureLoader {
  private _loader: THREE.TextureLoader = new THREE.TextureLoader();

  public load = (
    path: (string | TextureLoaderData) | ImageImportPromise
  ): Observable<IEvent<TextureLoadEventData>> => {
    if (path instanceof Promise) {
      return from(path).pipe(
        map(({ default: url }) => this.load(url)),
        mergeAll()
      );
    }

    if (typeof path === "string") {
      const event$ = from(this._loader.loadAsync(path)).pipe(
        map((texture) => {
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          // this.texture.repeat.set(2, 2);
          texture.encoding = THREE.sRGBEncoding;

          return new TextureLoadEvent({
            map: texture,
          });
        })
      );

      eventBus.trigger(event$);

      return event$;
    } else {
      const event$ = zip(
        this.resolvePath(path.basecolor, "map"),
        // .pipe(
        //   map(([key, texture]) => {
        //     texture.wrapS = THREE.RepeatWrapping;
        //     texture.wrapT = THREE.RepeatWrapping;
        //     // this.texture.repeat.set(2, 2);
        //     texture.encoding = THREE.sRGBEncoding;

        //     return [key, texture] as [string, THREE.Texture];
        //   })
        // ),
        path.ambientOcclusion
          ? this.resolvePath(path.ambientOcclusion, "aoMap")
          : EMPTY,
        path.height ? this.resolvePath(path.height, "displacementMap") : EMPTY,
        path.metallic ? this.resolvePath(path.metallic, "metalnessMap") : EMPTY,
        path.normal ? this.resolvePath(path.normal, "normalMap") : EMPTY,
        path.roughness
          ? this.resolvePath(path.roughness, "roughnessMap")
          : EMPTY
      ).pipe(
        map((values) => {
          return new TextureLoadEvent(
            values.reduce((acc, curr) => {
              acc[curr[0]] = curr[1];
              return acc;
            }, {} as any)
          );
        })
      );

      eventBus.trigger(event$);

      return event$;
    }
  };

  private mapToTextureTuple = (path: string, key: string) => {
    return from(this._loader.loadAsync(path)).pipe(
      map((val) => [key, val] as [string, THREE.Texture])
    );
  };

  private resolvePath = (
    path: ImageImportPromise | string,
    key: string
  ): Observable<[string, THREE.Texture]> => {
    return path instanceof Promise
      ? from(path).pipe(
          mergeMap(({ default: url }) => this.mapToTextureTuple(url, key))
        )
      : this.mapToTextureTuple(path, key);
  };
}

export default new TextureLoader();
