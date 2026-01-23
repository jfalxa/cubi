import { onMount } from "svelte";

import type { Shape } from "$/types";
import { parse, serialize } from "$/utils/persistency";
import { debounce } from "$/utils/timing";

import type { GridInit, GridStore } from "./grid.svelte";
import type { ShapeStore } from "./shape.svelte";

const KEY = "cubi:data";

export function useLocalStorageSync(
  shapeStore: ShapeStore,
  gridStore: GridStore,
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
