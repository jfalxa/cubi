import type { ShapeStore } from "$/stores/shape.svelte";

import type { Command } from ".";

export class NewCommand implements Command {
  label = "New";
  group = "file";

  shortcuts = ["ctrl+n", "command+n"];

  constructor(private shapes: ShapeStore) {}

  isAvailable() {
    return this.shapes.current.length > 0;
  }

  execute(): void {
    this.shapes.reset();
  }
}
