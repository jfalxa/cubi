import type { Vector2 } from "@babylonjs/core/Maths/math.vector";

import type { Box } from "$/types";

export class MeasureStore {
  box = $state<Box>();
  position = $state<Vector2>();

  update(box: Box, position: Vector2) {
    this.box = box;
    this.position = position;
  }

  clear() {
    this.box = undefined;
    this.position = undefined;
  }
}
