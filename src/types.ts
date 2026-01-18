import type { Vector3 } from "@babylonjs/core";

export interface Shape {
  id: string;
  group: string | undefined;
  position: Vector3;
  width: number;
  height: number;
  depth: number;
  color: string;
  locked: boolean;
}

export type PartialShape = Partial<Shape>;
export type PartialShapeWithId = PartialShape & { id: string };

export type SerializedShape = Omit<Shape, "position"> & { position: number[] };

export interface Box {
  width: number;
  height: number;
  depth: number;
}
