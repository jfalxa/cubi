import { Vector3 } from "@babylonjs/core/Maths/math.vector";

import type { Stage } from "$/stage";
import { DEFAULT_GRID, type GridStore } from "$/stores/grid.svelte";
import type { SelectionStore } from "$/stores/selection.svelte";
import type { ShapeStore } from "$/stores/shape.svelte";
import type { Shape } from "$/types";
import { getBBox } from "$/utils/bounds";
import { scaleShapes } from "$/utils/geometry";
import { parse, serialize } from "$/utils/persistency";
import { cloneShapes } from "$/utils/shape";

import type { Command } from ".";

export class CopyCommand implements Command {
  label = "Copy";
  group = "clipboard";

  shortcuts = ["ctrl+c", "command+c"];

  constructor(private grid: GridStore) {}

  isAvailable(context: Shape[]) {
    return context.length > 0;
  }

  execute(context: Shape[]): void {
    if (context.length === 0) return;

    const payload = serialize(context, {
      width: this.grid.width,
      depth: this.grid.depth,
      height: this.grid.height,
      unit: this.grid.unit,
    });

    navigator.clipboard.writeText(payload);
  }
}

export class PasteCommand implements Command {
  label = "Paste";
  group = "clipboard";

  shortcuts = ["ctrl+v", "command+v"];

  constructor(
    private shapes: ShapeStore,
    private selection: SelectionStore,
    private grid: GridStore,
    private stage: Stage,
  ) {}

  isAvailable() {
    return true;
  }

  async execute() {
    this.readClipboard().then((clipboard) => {
      if (clipboard.shapes.length === 0) return;

      const clones = cloneShapes(clipboard.shapes);
      const ratio = clipboard.grid.unit / this.grid.unit;
      const scaled = scaleShapes(clones, ratio);
      this.positionAtPointer(scaled);

      this.shapes.add(...scaled);
      this.selection.set(scaled.map((s) => s.id));
    });
  }

  private async readClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      return parse(text);
    } catch {
      return { shapes: [], grid: DEFAULT_GRID };
    }
  }

  private positionAtPointer(shapes: Shape[]) {
    const pointer = this.stage.getPointUnderPointer();
    const shift = new Vector3(1, 0, 1);

    if (pointer) {
      const { center, height } = getBBox(shapes);
      shift.x = pointer.x - center.x;
      shift.y = pointer.y - center.y + height / 2;
      shift.z = pointer.z - center.z;
    }

    for (const shape of shapes) {
      shape.position.addInPlace(shift);
    }
  }
}
