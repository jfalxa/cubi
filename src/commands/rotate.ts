import type { ShapeStore } from "$/stores/shape.svelte";
import type { Shape } from "$/types";
import { rotateShapes } from "$/utils/geometry";

import type { Command } from ".";

export class RotateCWCommand implements Command {
  label = "Rotate +90˚";
  group = "transform";

  shortcuts = ["r"];

  constructor(private shapes: ShapeStore) {}

  isAvailable(context: Shape[]) {
    return context.length > 0;
  }

  execute(context: Shape[]): void {
    this.shapes.update(...rotateShapes(context));
  }
}

export class RotateCCWCommand implements Command {
  label = "Rotate -90˚";
  group = "transform";

  shortcuts = ["shift+r"];

  constructor(private shapes: ShapeStore) {}

  isAvailable(context: Shape[]) {
    return context.length > 0;
  }

  execute(context: Shape[]): void {
    this.shapes.update(...rotateShapes(context, true));
  }
}
