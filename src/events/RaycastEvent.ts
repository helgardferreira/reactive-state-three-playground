import { IEvent } from "../utils/types";

export interface RaycastEventData {
  intersects: THREE.Intersection<THREE.Object3D<THREE.Event>>[];
  mousePointer: THREE.Vector2;
}

export class RaycastEvent implements IEvent<RaycastEventData> {
  type = "raycast";

  constructor(public data: RaycastEventData) {}
}
