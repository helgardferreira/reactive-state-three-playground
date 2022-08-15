import * as THREE from "three";
import { Observable, from } from "rxjs";
import { map } from "rxjs/operators";

import eventBus from "../../EventBus";
import { IEvent } from "../../utils/types";
import { TextureLoadEvent } from "../../events/TextureLoadEvent";

// TODO: implement state machine for TextureLoader
export class TextureLoader {
  private _loader: THREE.TextureLoader = new THREE.TextureLoader();

  public load(url: string): Observable<IEvent<THREE.Texture>> {
    const event$ = from(this._loader.loadAsync(url)).pipe(
      map((texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        // TODO: calculate how many times to repeat texture based on tile and floor size
        // this.texture.repeat.set(2, 2);
        texture.encoding = THREE.sRGBEncoding;

        return new TextureLoadEvent(texture);
      })
    );

    eventBus.trigger(event$);

    return event$;
  }
}

export default new TextureLoader();
