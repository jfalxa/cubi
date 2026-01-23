import { Vector3 } from "@babylonjs/core";

import type { BBox, Shape } from "$/types";

export function getCenter(shape: Shape) {
  return shape.position.add(getDimensions(shape).scale(1 / 2));
}

export function getDimensions(shape: Shape) {
  return new Vector3(shape.width, shape.height, shape.depth);
}

export function getBounds(shape: Shape) {
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

export function areShapesConnected(
  a: Shape,
  b: Shape,
  epsilon = 1e-6,
): boolean {
  const aBounds = getBounds(a);
  const bBounds = getBounds(b);

  const xOverlap =
    aBounds.min.x <= bBounds.max.x + epsilon &&
    aBounds.max.x + epsilon >= bBounds.min.x;
  const yOverlap =
    aBounds.min.y <= bBounds.max.y + epsilon &&
    aBounds.max.y + epsilon >= bBounds.min.y;
  const zOverlap =
    aBounds.min.z <= bBounds.max.z + epsilon &&
    aBounds.max.z + epsilon >= bBounds.min.z;

  return xOverlap && yOverlap && zOverlap;
}
