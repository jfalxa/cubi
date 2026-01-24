import "@babylonjs/core/Culling/ray";

import { Plane } from "@babylonjs/core/Maths/math.plane";
import { Matrix, Vector2, Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { TargetCamera } from "@babylonjs/core/Cameras/targetCamera";

import { Grid } from "$/stage/grid";
import type { Shape } from "$/types";

export function getGridPoint(
  pointer: Vector2,
  camera: TargetCamera,
  grid: Grid,
): Vector3 | undefined {
  const scene = camera.getScene();

  const planeY = grid.layer;
  const plane = Plane.FromPositionAndNormal(
    new Vector3(0, planeY, 0),
    Vector3.Up(),
  );

  const ray = scene.createPickingRay(
    pointer.x,
    pointer.y,
    Matrix.Identity(),
    camera,
  );
  const distance = ray.intersectsPlane(plane);

  if (distance === null) return;

  const point = ray.origin.add(ray.direction.scale(distance));
  return Grid.snap(point);
}

export function getElevation(
  pointer: Vector2,
  camera: TargetCamera,
  reference: Shape,
) {
  const { position, width, depth } = reference;

  const axisOrigin = position.add(new Vector3(width / 2, 0, depth / 2));
  const axisDir = Vector3.Up();

  const axisPoint = getAxisPoint(pointer, camera, axisOrigin, axisDir);
  const deltaY = axisPoint.y - axisOrigin.y;

  return Math.round(deltaY);
}

export function getAxisPoint(
  pointer: Vector2,
  camera: TargetCamera,
  origin: Vector3,
  axis: Vector3,
) {
  const scene = camera.getScene();

  const ray = scene.createPickingRay(
    pointer.x,
    pointer.y,
    Matrix.Identity(),
    camera,
  );
  const originToAxis = ray.origin.subtract(origin);

  const a = Vector3.Dot(ray.direction, ray.direction);
  const b = Vector3.Dot(ray.direction, axis);
  const c = Vector3.Dot(axis, axis);
  const d = Vector3.Dot(ray.direction, originToAxis);
  const e = Vector3.Dot(axis, originToAxis);

  const denom = a * c - b * b;

  let axisT: number;
  if (Math.abs(denom) < 1e-6) {
    axisT = e / c;
  } else {
    const rayT = (b * e - c * d) / denom;
    if (rayT < 0) {
      axisT = e / c;
    } else {
      axisT = (a * e - b * d) / denom;
    }
  }

  return origin.add(axis.scale(axisT));
}
