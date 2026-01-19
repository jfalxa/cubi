import { Vector3 } from "@babylonjs/core";

import type { PartialShape, SerializedShape, Shape } from "$/types";

import { areShapesConnected, getBounds } from "./bounds";
import { groupBy } from "./collection";

export function createShape(init: PartialShape): Shape {
  return {
    id: init.id ?? crypto.randomUUID(),
    group: init.group,
    position: init.position ?? Vector3.Zero(),
    width: init.width ?? 0,
    height: init.height ?? 0,
    depth: init.depth ?? 0,
    color: init.color ?? "#000000",
    locked: false,
  };
}

export function cloneShape(shape: Shape, overwrite?: PartialShape): Shape {
  return {
    ...shape,
    position: shape.position.clone(),
    ...overwrite,
    id: overwrite?.id ?? crypto.randomUUID(),
  };
}

export function cloneShapes(shapes: Shape[]) {
  const clones = shapes.map((s) => cloneShape(s));
  const grouped = groupBy(clones, (s) => s.group);

  for (const [group, shapes] of Object.entries(grouped)) {
    if (group === String(undefined)) continue;
    const newGroup = crypto.randomUUID();
    grouped[group] = shapes.map((s) => ({ ...s, group: newGroup }));
  }

  return Object.values(grouped).flatMap((s) => s);
}

export function stringifyShapes(shapes: Shape[]) {
  return JSON.stringify(
    shapes.map((s) => ({ ...s, position: s.position.asArray() })),
  );
}

export function parseShapes(shapes: string): Shape[] {
  try {
    const json = JSON.parse(shapes) as SerializedShape[];
    const result = json.map((s) => ({ ...s, position: Vector3.FromArray(s.position) })); // prettier-ignore
    return cloneShapes(result);
  } catch {
    return [];
  }
}

export function isValid(shape: Shape) {
  return (
    [shape.width, shape.height, shape.depth].filter((d) => d != 0).length >= 2
  );
}

export function normalizeShape(shape: Shape): Shape {
  let { position, width, height, depth } = shape;
  if (width >= 0 && height >= 0 && depth >= 0) return shape;

  position = position.clone();

  if (width < 0) {
    position.x += width;
    width = Math.abs(width);
  }

  if (height < 0) {
    position.y += height;
    height = Math.abs(height);
  }

  if (depth < 0) {
    position.z += depth;
    depth = Math.abs(depth);
  }

  return { ...shape, position, width, height, depth };
}

export function subtractShapes(a: Shape, b: Shape): Shape[] {
  if (!areShapesConnected(a, b)) return [a];

  const { min: aMin, max: aMax } = getBounds(a);
  const { min: bMin, max: bMax } = getBounds(b);

  const iMin = Vector3.Maximize(aMin, bMin);
  const iMax = Vector3.Minimize(aMax, bMax);

  const epsilon = 1e-6;
  if (
    iMax.x - iMin.x <= epsilon ||
    iMax.y - iMin.y <= epsilon ||
    iMax.z - iMin.z <= epsilon
  ) {
    return [a];
  }

  const makeBox = (min: Vector3, max: Vector3) => {
    const width = max.x - min.x;
    const height = max.y - min.y;
    const depth = max.z - min.z;

    if (width <= epsilon || height <= epsilon || depth <= epsilon) return null;

    return cloneShape(a, {
      position: new Vector3(min.x, min.y, min.z),
      width,
      height,
      depth,
    });
  };

  const boxes = [
    // left
    makeBox(
      new Vector3(aMin.x, aMin.y, aMin.z),
      new Vector3(iMin.x, aMax.y, aMax.z),
    ),
    // right
    makeBox(
      new Vector3(iMax.x, aMin.y, aMin.z),
      new Vector3(aMax.x, aMax.y, aMax.z),
    ),
    // bottom
    makeBox(
      new Vector3(iMin.x, aMin.y, aMin.z),
      new Vector3(iMax.x, iMin.y, aMax.z),
    ),
    // top
    makeBox(
      new Vector3(iMin.x, iMax.y, aMin.z),
      new Vector3(iMax.x, aMax.y, aMax.z),
    ),
    // front
    makeBox(
      new Vector3(iMin.x, iMin.y, aMin.z),
      new Vector3(iMax.x, iMax.y, iMin.z),
    ),
    // back
    makeBox(
      new Vector3(iMin.x, iMin.y, iMax.z),
      new Vector3(iMax.x, iMax.y, aMax.z),
    ),
  ];

  return boxes.filter((box): box is Shape => box !== null);
}
