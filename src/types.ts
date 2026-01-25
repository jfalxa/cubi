import type { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";

export interface Shape {
  id: string;
  group: string | undefined;
  position: Vector3; // box corner with minimal x,y,z
  width: number;
  height: number;
  depth: number;
  color: string;
  locked: boolean;
}

export type PartialShape = Partial<Shape>;
export type PartialShapeWithId = PartialShape & { id: string };

export type SerializedShape = Omit<Shape, "position"> & {
  position: [number, number, number];
};

export interface Box {
  width: number;
  height: number;
  depth: number;
}

export interface Bounds {
  min: Vector3;
  max: Vector3;
}

export interface BBox extends Box, Bounds {
  center: Vector3;
}

export type MeshFilter = (mesh: AbstractMesh) => boolean;
