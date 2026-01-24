import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { CreateBoxVertexData } from "@babylonjs/core/Meshes/Builders/boxBuilder";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { Scene } from "@babylonjs/core/scene";

import type { MeshFilter, Shape } from "$/types";
import { getBBox } from "$/utils/bounds";
import { getColors } from "$/utils/colors";

export class BoundingBox extends Mesh {
  static only: MeshFilter = (mesh) => mesh.name === "bounding-box";
  static ignore: MeshFilter = (mesh) => mesh.name !== "bounding-box";

  constructor(scene: Scene) {
    super("bounding-box", scene);

    this.setEnabled(false);

    this.initVertexData();
    this.initMaterial();
  }

  update(shapes: Shape[]) {
    if (shapes.length === 0) {
      this.setEnabled(false);
      return;
    }

    const { center, width, height, depth } = getBBox(shapes);

    const p = 0.01; // padding
    this.scaling.set(width + p, height + p, depth + p);
    this.position.copyFrom(center);

    this.disableEdgesRendering();
    this.enableEdgesRendering();
    this.edgesWidth = 8;
    this.edgesColor = Color4.FromHexString(getColors().ghost);

    this.setEnabled(true);
  }

  private initVertexData() {
    const vertexData = CreateBoxVertexData({ size: 1 });
    vertexData.applyToMesh(this, true);
  }

  private initMaterial() {
    const material = new StandardMaterial(
      "bounding_box_material",
      this.getScene(),
    );
    material.specularColor = Color3.Black();
    material.diffuseColor = Color3.FromHexString(getColors().ghost);
    material.alpha = 0.33;
    this.material = material;
  }
}
