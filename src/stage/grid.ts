import {
  Color3,
  DynamicTexture,
  GroundMesh,
  MeshBuilder,
  StandardMaterial,
  Texture,
  Vector3,
  type MeshPredicate,
} from "@babylonjs/core";

import type { View } from "./view";

export class Grid {
  static ignore: MeshPredicate = (mesh) => mesh.name !== "grid";

  view: View;
  mesh: GroundMesh;
  texture: DynamicTexture;

  width = 1;
  depth = 1;
  layer = 0;

  constructor(view: View) {
    this.view = view;
    this.mesh = this.createMesh();
    this.texture = this.createTexture();
    this.mesh.material = this.createMaterial();
  }

  static snap(point: Vector3) {
    return new Vector3(
      Math.round(point.x),
      Math.round(point.y),
      Math.round(point.z)
    );
  }

  dispose() {
    this.mesh.dispose();
  }

  setSize(width: number, depth: number) {
    this.width = width;
    this.depth = depth;

    this.mesh.scaling.set(width, 1, depth);

    this.texture.uScale = width;
    this.texture.vScale = depth;
    this.texture.update();
  }

  setLayer(layer: number) {
    this.layer = Math.max(layer, 0);
    this.mesh.position.set(0, this.layer + 0.01, 0);
  }

  private createMesh() {
    return MeshBuilder.CreateGround(
      "grid", //
      { width: 1, height: 1 },
      this.view.scene
    );
  }

  private createTexture() {
    const size = 512;

    const texture = new DynamicTexture(
      "grid_texture",
      { width: size, height: size },
      this.view.scene,
      true
    );

    const ctx = texture.getContext();

    const lineWidth = Math.max(1, Math.floor(size / 256));

    ctx.clearRect(0, 0, size, size);

    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fillRect(0, 0, size, size);

    ctx.fillStyle = "#999999";
    ctx.fillRect(0, 0, size, lineWidth);
    ctx.fillRect(0, size - lineWidth, size, lineWidth);
    ctx.fillRect(0, 0, lineWidth, size);
    ctx.fillRect(size - lineWidth, 0, lineWidth, size);

    texture.hasAlpha = true;
    texture.wrapU = Texture.WRAP_ADDRESSMODE;
    texture.wrapV = Texture.WRAP_ADDRESSMODE;

    texture.anisotropicFilteringLevel = 4;
    texture.update(true);

    return texture;
  }

  private createMaterial() {
    const material = new StandardMaterial("grid", this.view.scene);

    material.specularColor = Color3.Black();
    material.backFaceCulling = false;
    material.diffuseTexture = this.texture;
    material.opacityTexture = this.texture;
    material.useAlphaFromDiffuseTexture = true;

    return material;
  }
}
