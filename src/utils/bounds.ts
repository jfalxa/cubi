import { Vector3 } from "@babylonjs/core";

import type { BBox, Bounds, Shape } from "$/types";

export function getCenter(shape: Shape) {
  return shape.position.add(getDimensions(shape).scale(1 / 2));
}

export function getDimensions(shape: Shape) {
  return new Vector3(shape.width, shape.height, shape.depth);
}

export function getBounds(shape: Shape): Bounds {
  const min = shape.position.clone();
  const max = shape.position.add(getDimensions(shape));
  return { min, max };
}

export function getBBox(shapes: Shape[]): BBox {
  let min = new Vector3(Infinity, Infinity, Infinity);
  let max = new Vector3(-Infinity, -Infinity, -Infinity);

  for (const shape of shapes) {
    const bbox = getBounds(shape);
    min = Vector3.Minimize(min, bbox.min);
    max = Vector3.Maximize(max, bbox.max);
  }

  const width = max.x - min.x;
  const height = max.y - min.y;
  const depth = max.z - min.z;
  const center = min.add(new Vector3(width / 2, height / 2, depth / 2));

  return { center, width, height, depth, min, max };
}

export function getHeight(shapes: Shape[]): number {
  if (shapes.length === 0) return 0;

  let height = 0;
  for (const shape of shapes) {
    const shapeHeight = shape.position.y + shape.height;
    if (shapeHeight > height) height = shapeHeight;
  }

  return height;
}

export function areShapesConnected(
  a: Shape,
  b: Shape,
  epsilon = 1e-6,
): boolean {
  const aBounds = getBounds(a);
  const bBounds = getBounds(b);

  const xOverlap = hasOverlap("x", aBounds, bBounds, epsilon);
  const yOverlap = hasOverlap("y", aBounds, bBounds, epsilon);
  const zOverlap = hasOverlap("z", aBounds, bBounds, epsilon);

  return xOverlap && yOverlap && zOverlap;
}

type Axis = "x" | "y" | "z";

export function hasOverlap(axis: Axis, a: Bounds, b: Bounds, epsilon = 1e-6) {
  const isOverlapMin = a.min[axis] <= b.max[axis] + epsilon;
  const isOverlapMax = a.max[axis] + epsilon >= b.min[axis];
  return isOverlapMin && isOverlapMax;
}
