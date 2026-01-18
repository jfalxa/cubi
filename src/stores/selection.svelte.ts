import type { Stage } from "$/stage";
import type { SelectionTool } from "$/tools/selection";

import type { ShapeStore } from "./shape.svelte";

export class SelectionStore {
  private shapeStore: ShapeStore;

  selected = $state<string[]>([]);

  constructor(shapeStore: ShapeStore) {
    this.shapeStore = shapeStore;
  }

  set(selected: string[]) {
    this.selected = selected;
  }

  has(id: string) {
    return this.selected.includes(id);
  }

  clear() {
    this.selected = [];
  }

  refresh() {
    const ids = this.shapeStore.current
      .filter((s) => !s.locked)
      .map((s) => s.id);

    this.selected = this.selected.filter((id) => ids.includes(id));
  }

  getSelectedShapes() {
    return this.shapeStore.current.filter((s) => this.has(s.id));
  }
}

export function useSelectionSync(
  selectionStore: SelectionStore,
  stage: Stage,
  selectionTool: SelectionTool,
) {
  $effect(() => {
    const shapes = selectionStore.getSelectedShapes();
    stage.boundingBox.update(shapes);
  });

  $effect(() => {
    if (!selectionTool.equals(selectionStore.selected)) {
      selectionTool.set(selectionStore.selected);
    }
  });

  $effect(() => {
    const shapes = stage.view.getMeshes();
    const selected = selectionStore.selected;

    for (const shape of shapes) {
      shape.setSelected(selected.includes(shape.id));
    }
  });
}
