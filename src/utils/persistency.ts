import { Vector3 } from "@babylonjs/core";

import { DEFAULT_GRID, type GridInit } from "$/stores/grid.svelte";
import type { SerializedShape, Shape } from "$/types";

import { cloneShapes } from "./shape";

export function serialize(shapes: Shape[], grid: GridInit) {
  return JSON.stringify({
    grid: {
      width: grid.width ?? DEFAULT_GRID.width,
      depth: grid.depth ?? DEFAULT_GRID.depth,
      height: grid.height ?? DEFAULT_GRID.height,
      unit: grid.unit,
    },

    shapes: shapes.map((shape) => ({
      ...shape,
      position: shape.position.asArray(),
    })),
  });
}

interface SerializedScene {
  shapes: SerializedShape[];
  grid: GridInit;
}

export function parse(data: string): { shapes: Shape[]; grid: GridInit } {
  try {
    const scene = JSON.parse(data) as SerializedScene;

    const shapes = (scene.shapes ?? []).map((shape) => ({
      ...shape,
      position: Vector3.FromArray(shape.position),
    }));

    return { shapes: cloneShapes(shapes), grid: scene.grid ?? DEFAULT_GRID };
  } catch {
    return { shapes: [], grid: DEFAULT_GRID };
  }
}
