import type { ShapeStore } from "$/stores/shape.svelte";
import type { Shape } from "$/types";

import type { Command } from ".";

export class GroupCommand implements Command {
  label = "Group";
  group = "shapes";

  shortcuts = ["g"];

  constructor(private shapes: ShapeStore) {}

  isAvailable(context: Shape[]) {
    if (context.length <= 1) return false;
    const groups = context.map((s) => s.group).filter(Boolean) as string[];
    return new Set(groups).size !== 1;
  }

  execute(context: Shape[]): void {
    const group = crypto.randomUUID();
    this.shapes.update(...context.map((s) => ({ ...s, group })));
  }
}

export class UngroupCommand implements Command {
  label = "Ungroup";
  group = "shapes";

  shortcuts = ["shift+g"];

  constructor(private shapes: ShapeStore) {}

  isAvailable(context: Shape[]) {
    return context.some((s) => s.group !== undefined);
  }

  execute(context: Shape[]): void {
    this.shapes.update(...context.map((s) => ({ ...s, group: undefined })));
  }
}
