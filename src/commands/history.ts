import type { SelectionStore } from "$/stores/selection.svelte";
import type { ShapeStore } from "$/stores/shape.svelte";

import type { Command } from ".";

export class UndoCommand implements Command {
  label = "Undo";
  group = "history";

  shortcuts = ["ctrl+z", "command+z"];

  constructor(
    private shapes: ShapeStore,
    private selection: SelectionStore,
  ) {}

  isAvailable() {
    return this.shapes.canUndo();
  }

  execute(): void {
    this.shapes.undo();
    this.selection.refresh();
  }
}

export class RedoCommand implements Command {
  label = "Redo";
  group = "history";

  shortcuts = ["ctrl+shift+z", "command+shift+z"];

  constructor(
    private shapes: ShapeStore,
    private selection: SelectionStore,
  ) {}

  isAvailable() {
    return this.shapes.canRedo();
  }

  execute(): void {
    this.shapes.redo();
    this.selection.refresh();
  }
}
