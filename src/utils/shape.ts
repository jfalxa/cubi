import { Vector3 } from "@babylonjs/core";

import type { PartialShape, SerializedShape, Shape } from "$/types";

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
    shapes.map((s) => ({ ...s, position: s.position.asArray() }))
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
