import type { Commands } from "$/commands";
import type { Stage } from "$/stage";
import type { Tools } from "$/tools";

import {
  CameraStore,
  useCameraSync,
  useFirstPersonSync,
} from "./camera.svelte";
import { MenuStore, useMenuSync } from "./context-menu.svelte";
import { GridStore, useGridSync } from "./grid.svelte";
import { useLocalStorageSync } from "./local-storage.svelte";
import { MeasureStore } from "./measure.svelte";
import { SelectionStore, useSelectionSync } from "./selection.svelte";
import { ShapeStore, useShapeSync } from "./shape.svelte";

export interface Stores {
  shapes: ShapeStore;
  camera: CameraStore;
  grid: GridStore;
  selection: SelectionStore;
  menu: MenuStore;
  measure: MeasureStore;
}

export function createStores() {
  const shapes = new ShapeStore();
  const camera = new CameraStore();
  const grid = new GridStore();
  const selection = new SelectionStore(shapes);
  const menu = new MenuStore();
  const measure = new MeasureStore();

  return { shapes, camera, grid, selection, menu, measure };
}

export function useSync(
  stores: Stores,
  stage: Stage,
  commands: Commands,
  tools: Tools,
) {
  useMenuSync(stores.menu, commands);
  useCameraSync(stores.camera, stage.camera);
  useFirstPersonSync(stores.camera, stores.selection, stores.measure, stage);
  useGridSync(stores.grid, stage);
  useShapeSync(stores.shapes, stage.view);
  useSelectionSync(stores.selection, stage, tools.selection);
  useLocalStorageSync(stores.shapes, stores.grid, stores.camera);
}
