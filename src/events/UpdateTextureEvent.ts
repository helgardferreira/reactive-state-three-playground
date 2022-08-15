import { IEvent } from "../utils/types";

export class UpdateTextureEvent implements IEvent<string> {
  type = "updateTexture";

  constructor(public data: string) {}
}
