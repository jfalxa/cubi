import type { Stage } from "$/stage";
import type { Tools } from "$/tools";

import { CameraStore, useCameraSync } from "./camera.svelte";
import { ContextMenuStore } from "./context-menu.svelte";
import { GridStore, useGridSync } from "./grid.svelte";
import { MeasureStore } from "./measure.svelte";
import { ModeStore } from "./mode.svelte";
import { SelectionStore, useSelectionSync } from "./selection.svelte";
import { ShapeStore, useShapeSync } from "./shape.svelte";

export interface Stores {
  shapes: ShapeStore;
  camera: CameraStore;
  grid: GridStore;
  selection: SelectionStore;
  contextMenu: ContextMenuStore;
  measure: MeasureStore;
  mode: ModeStore;
}

export function createStores() {
  const shapes = new ShapeStore();
  const camera = new CameraStore();
  const grid = new GridStore();
  const selection = new SelectionStore(shapes);
  const contextMenu = new ContextMenuStore();
  const draw = new MeasureStore();
  const mode = new ModeStore();

  return { shapes, camera, grid, selection, contextMenu, measure: draw, mode };
}

export function useSync(stores: Stores, stage: Stage, tools: Tools) {
  useCameraSync(stores.camera, stage.camera);
  useGridSync(stores.grid, stage.grid);
  useShapeSync(stores.shapes, stage.view);
  useSelectionSync(stores.selection, stage, tools.selection);
}
