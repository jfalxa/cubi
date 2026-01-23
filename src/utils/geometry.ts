import { Vector3 } from "@babylonjs/core";

import { Grid } from "$/stage/grid";
import type { Shape } from "$/types";

import { getBBox } from "./bounds";
import { normalizeShape } from "./shape";

export function rotateShapes(
  shapes: Shape[],
  counterclockwise = false,
): Shape[] {
  if (shapes.length === 0) return [];

  const { min, max } = getBBox(shapes);

  return shapes.map((shape) => {
    const smin = shape.position;
    const smax = shape.position.add(new Vector3(shape.width, 0, shape.depth));

    const x = counterclockwise
      ? min.x + (max.z - smax.z)
      : min.x + (smin.z - min.z);
    const z = counterclockwise
      ? min.z + (smin.x - min.x)
      : min.z + (max.x - smax.x);

    const position = new Vector3(x, shape.position.y, z);
    const width = shape.depth;
    const depth = shape.width;

    return { ...shape, position, width, depth };
  });
}

export function scaleShapes(shapes: Shape[], ratio: number) {
  return shapes.map((s) => ({
    ...s,
    position: s.position.scale(ratio),
    width: s.width * ratio,
    height: s.height * ratio,
    depth: s.depth * ratio,
  }));
}

export function resizeShapes(
  shapes: Shape[],
  amount: Vector3,
  axis: Vector3,
): Shape[] {
  return shapes.map((shape) => {
    const position = shape.position.subtract(
      new Vector3(
        axis.x < 0 ? amount.x : 0, //
        axis.y < 0 ? amount.y : 0,
        axis.z < 0 ? amount.z : 0,
      ),
    );

    const width = shape.width + amount.x;
    const height = shape.height + amount.y;
    const depth = shape.depth + amount.z;

    return normalizeShape({ ...shape, position, width, height, depth });
  });
}

export function resizeShapesAt(
  shapes: Shape[],
  amount: Vector3,
  anchor: Vector3,
): Shape[] {
  if (shapes.length === 0) return [];

  const bbox = getBBox(shapes);

  const scale = new Vector3(
    bbox.width === 0 ? 1 : (bbox.width + amount.x) / bbox.width,
    bbox.height === 0 ? 1 : (bbox.height + amount.y) / bbox.height,
    bbox.depth === 0 ? 1 : (bbox.depth + amount.z) / bbox.depth,
  );

  return shapes.map((shape) => {
    const delta = shape.position.subtract(anchor);
    const position = delta.multiply(scale).add(anchor);

    return normalizeShape({
      ...shape,
      position: Grid.snap(position),
      width: Math.round(shape.width * scale.x),
      height: Math.round(shape.height * scale.y),
      depth: Math.round(shape.depth * scale.z),
    });
  });
}
