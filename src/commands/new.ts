import type { ContextMenuStore } from "$/stores/context-menu.svelte";
import type { ShapeStore } from "$/stores/shape.svelte";

import type { Command } from ".";

export class NewCommand implements Command {
  label = "New";
  group = "file";

  shortcuts = ["ctrl+n", "command+n"];

  constructor(
    private shapes: ShapeStore,
    private contextMenu: ContextMenuStore,
  ) {}

  isAvailable() {
    return this.shapes.current.length > 0;
  }

  execute(): void {
    if (this.shapes.current.length === 0) return;
    this.contextMenu.showNewDialog = true;
  }
}
