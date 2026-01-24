import { onMount } from "svelte";

import type { Shape } from "$/types";
import { getBBox, getHeight } from "$/utils/bounds";
import { parse, serialize } from "$/utils/persistency";
import { debounce } from "$/utils/timing";

import type { CameraStore } from "./camera.svelte";
import type { GridInit, GridStore } from "./grid.svelte";
import type { ShapeStore } from "./shape.svelte";

const KEY = "cubi:data";

export function useLocalStorageSync(
  shapeStore: ShapeStore,
  gridStore: GridStore,
  cameraStore: CameraStore,
) {
  const loadFromStorage = (shapeStore: ShapeStore, gridStore: GridStore) => {
    const data = localStorage.getItem(KEY);
    const scene = parse(data ?? "{}");
    shapeStore.reset(scene.shapes);
    gridStore.update(scene.grid);
  };

  const saveToStorage = debounce((shapes: Shape[], grid: GridInit) => {
    const data = serialize(shapes, grid);
    localStorage.setItem(KEY, data);
  });

  onMount(() => {
    loadFromStorage(shapeStore, gridStore);
    const height = getHeight(shapeStore.current);
    cameraStore.fit(gridStore.width, height, gridStore.depth);
  });

  $effect(() => {
    saveToStorage(shapeStore.current, {
      width: gridStore.width,
      depth: gridStore.depth,
      height: gridStore.height,
      unit: gridStore.unit,
    });
  });
}
