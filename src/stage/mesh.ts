import type { Scene } from "@babylonjs/core";
import {
  Color3,
  Color4,
  Mesh,
  StandardMaterial,
  Vector3,
  VertexBuffer,
  VertexData,
} from "@babylonjs/core";

import type { Shape } from "$/types";

export class ShapeMesh extends Mesh {
  private static i = 1;

  declare metadata: {
    shape: Shape;
    selected: boolean;
  };

  ghost: boolean;

  constructor(shape: Shape, scene: Scene, ghost = false) {
    super(shape.id, scene);

    this.id = shape.id;
    this.metadata = { shape, selected: false };

    this.ghost = ghost;
    this.isPickable = !ghost;

    this.edgesColor = Color4.FromHexString(shape.color);

    this.initVertexData(shape);
    this.initMaterial(shape);
    this.updateEdges();
  }

  update(shape: Shape) {
    // only update when reference shape object has changed
    if (shape === this.metadata.shape) return;

    this.metadata.shape = shape;
    this.updateVertexData(shape);
    this.updateMaterial(shape);
    this.updateEdges();
  }

  isSelected() {
    return this.metadata.selected;
  }

  setSelected(selected: boolean) {
    const color = selected ? "#76bdd5" : this.metadata.shape.color;
    this.edgesColor = Color4.FromHexString(color);
    this.edgesWidth = selected ? 3 : 1;
    this.metadata.selected = selected;
  }

  private initVertexData(shape: Shape) {
    const { positions, normals, indices } = this.buildVertexData(shape);
    const vertexData = new VertexData();
    vertexData.positions = positions;
    vertexData.indices = indices;
    vertexData.normals = normals;
    vertexData.applyToMesh(this, true);
  }

  private initMaterial(shape: Shape) {
    const material = new StandardMaterial(
      `${this.id}_material`,
      this.getScene()
    );
    material.specularColor = Color3.Black();
    material.diffuseColor = Color3.FromHexString(shape.color);
    material.zOffset = this.ghost ? -10 : -0.01 * ShapeMesh.i++;
    if (this.ghost) material.alpha = 0.33;
    this.material = material;
  }

  private updateEdges() {
    this.disableEdgesRendering();
    this.enableEdgesRendering();
  }

  private updateVertexData(shape: Shape) {
    const { positions, normals } = this.buildVertexData(shape);
    this.updateVerticesData(VertexBuffer.PositionKind, positions, true);
    this.updateVerticesData(VertexBuffer.NormalKind, normals);
  }

  private updateMaterial(shape: Shape) {
    if (this.material instanceof StandardMaterial) {
      this.material.diffuseColor = Color3.FromHexString(shape.color);
    }
  }

  private buildVertexData(shape: Shape) {
    const width = new Vector3(shape.width, 0, 0);
    const height = new Vector3(0, shape.height, 0);
    const depth = new Vector3(0, 0, shape.depth);

    const b0 = shape.position;
    const b1 = b0.add(width);
    const b2 = b0.add(width).add(depth);
    const b3 = b0.add(depth);

    const t0 = b0.add(height);
    const t1 = t0.add(width);
    const t2 = t0.add(width).add(depth);
    const t3 = t0.add(depth);

    const corners = [b0, b1, b2, b3, t0, t1, t2, t3];

    const positions: number[] = [];
    const indices: number[] = [];
    const normals: number[] = [];

    for (let i = 0; i < ShapeMesh.indices.length; i += 3) {
      const a = corners[ShapeMesh.indices[i]];
      const b = corners[ShapeMesh.indices[i + 1]];
      const c = corners[ShapeMesh.indices[i + 2]];

      positions.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
      indices.push(i, i + 1, i + 2);
    }

    VertexData.ComputeNormals(positions, indices, normals);

    return { positions, normals, indices };
  }

  // prettier-ignore
  static indices = [
		// bottom
		0, 2, 1, 0, 3, 2,
		// top
		4, 5, 6, 4, 6, 7,
		// front
		3, 6, 2, 3, 7, 6,
		// back
		0, 1, 5, 0, 5, 4,
		// right
		1, 2, 6, 1, 6, 5,
		// left
		0, 7, 3, 0, 4, 7
	];
}
