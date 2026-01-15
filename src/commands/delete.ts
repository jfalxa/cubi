import type { SelectionStore } from "$/stores/selection.svelte";
import type { ShapeStore } from "$/stores/shape.svelte";
import type { Shape } from "$/types";

import type { Command } from ".";

export class DeleteCommand implements Command {
  label = "Delete";
  group = "shapes";

  shortcuts = ["delete", "backspace"];

  constructor(private shapes: ShapeStore, private selection: SelectionStore) {}

  isAvailable(context: Shape[]) {
    return context.length > 0;
  }

  execute(context: Shape[]): void {
    this.shapes.remove(...context);
    this.selection.refresh();
  }
}
