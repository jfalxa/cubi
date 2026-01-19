import { Vector3 } from "@babylonjs/core";

import type { SelectionStore } from "$/stores/selection.svelte";
import type { ShapeStore } from "$/stores/shape.svelte";
import type { Shape } from "$/types";
import { cloneShapes } from "$/utils/shape";

import type { Command } from ".";

export class DuplicateCommand implements Command {
  label = "Duplicate";
  group = "shapes";

  shortcuts = ["d"];

  constructor(
    private shapes: ShapeStore,
    private selection: SelectionStore,
  ) {}

  isAvailable(context: Shape[]) {
    return context.length > 0;
  }

  execute(context: Shape[]): void {
    const shift = new Vector3(1, 0, 1);
    const clones = cloneShapes(context);

    for (const shape of clones) {
      shape.position.addInPlace(shift);
    }

    this.shapes.add(...clones);
    this.selection.set(clones.map((s) => s.id));
  }
}
