import type { ShapeStore } from "$/stores/shape.svelte";
import type { Shape } from "$/types";

import type { Command } from ".";

export class LockCommand implements Command {
  label = "Lock";
  group = "shapes";

  shortcuts = ["l"];

  constructor(private shapes: ShapeStore) {}

  isAvailable(context: Shape[]) {
    return context.some((s) => !s.locked);
  }

  execute(context: Shape[]): void {
    this.shapes.lock(...context);
  }
}

export class UnlockCommand implements Command {
  label = "Unlock";
  group = "shapes";

  shortcuts = ["shift+l"];

  constructor(private shapes: ShapeStore) {}

  isAvailable(context: Shape[]) {
    return context.some((s) => s.locked);
  }

  execute(context: Shape[]): void {
    this.shapes.unlock(...context);
  }
}
