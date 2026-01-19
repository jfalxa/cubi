import {
  Color3,
  DynamicTexture,
  GroundMesh,
  MeshBuilder,
  StandardMaterial,
  Texture,
  Vector3,
} from "@babylonjs/core";

import { getColors, watchAppearance, type Colors } from "$/colors";
import type { MeshFilter } from "$/types";

import type { View } from "./view";

export class Grid {
  static only: MeshFilter = (mesh) => mesh.name === "grid";
  static ignore: MeshFilter = (mesh) => mesh.name !== "grid";

  static gridCellsPerTile = 10;

  view: View;
  mesh: GroundMesh;
  texture: DynamicTexture;

  width = 1;
  depth = 1;
  layer = 0;

  private removeAppearanceListener: () => void;

  constructor(view: View) {
    this.view = view;
    this.mesh = this.createMesh();
    this.texture = this.createTexture(getColors());
    this.mesh.material = this.createMaterial();

    this.removeAppearanceListener = watchAppearance(this.handleAppearance);
  }

  static snap(point: Vector3) {
    return new Vector3(
      Math.round(point.x),
      Math.round(point.y),
      Math.round(point.z),
    );
  }

  dispose() {
    this.removeAppearanceListener();
    this.mesh.dispose();
  }

  setSize(width: number, depth: number) {
    this.width = width;
    this.depth = depth;

    this.mesh.scaling.set(width, 1, depth);

    this.texture.uScale = width / Grid.gridCellsPerTile;
    this.texture.vScale = depth / Grid.gridCellsPerTile;

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
      this.view.scene,
    );
  }

  private createTexture(colors: Colors) {
    const size = 512;
    const cells = Grid.gridCellsPerTile;
    const cellSize = size / cells;

    const texture = new DynamicTexture(
      "grid_texture",
      { width: size, height: size },
      this.view.scene,
      true,
    );

    const ctx = texture.getContext();

    const minorLineWidth = Math.max(1, Math.floor(size / 512));
    const midLineWidth = Math.max(2, minorLineWidth * 2);
    const majorLineWidth = Math.max(3, minorLineWidth * 4);

    ctx.clearRect(0, 0, size, size);

    ctx.fillStyle = colors.grid;
    ctx.fillRect(0, 0, size, size);

    const drawLine = (pos: number, width: number, isVertical: boolean) => {
      const offset = Math.round(pos - width / 2);

      if (isVertical) {
        ctx.fillRect(offset, 0, width, size);
      } else {
        ctx.fillRect(0, offset, size, width);
      }
    };

    for (let i = 0; i <= cells; i += 1) {
      let lineWidth: number;

      if (i % 10 === 0) {
        ctx.fillStyle = colors.major;
        lineWidth = majorLineWidth;
      } else if (i % 5 === 0) {
        ctx.fillStyle = colors.mid;
        lineWidth = midLineWidth;
      } else {
        ctx.fillStyle = colors.minor;
        lineWidth = minorLineWidth;
      }

      const pos = i * cellSize;
      drawLine(pos, lineWidth, true);
      drawLine(pos, lineWidth, false);
    }

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

  private handleAppearance = (colors: Colors) => {
    this.texture = this.createTexture(colors);
    this.mesh.material = this.createMaterial();
    this.setSize(this.width, this.depth);
  };
}
