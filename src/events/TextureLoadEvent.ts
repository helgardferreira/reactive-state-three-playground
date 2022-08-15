import { IEvent } from "../utils/types";

export class TextureLoadEvent implements IEvent<THREE.Texture> {
  type = "textureLoad";

  constructor(public data: THREE.Texture) {}
}
