import {
  Color4,
  Engine,
  HemisphericLight,
  Light,
  Scene,
  Vector3,
} from "@babylonjs/core";

import { getColors, watchAppearance, type Colors } from "$/colors";
import { ShapeMesh } from "$/stage/mesh";
import type { Shape } from "$/types";

export class View {
  canvas: HTMLCanvasElement;
  engine: Engine;
  scene: Scene;
  light: Light;

  private removeAppearanceListener: () => void;

  constructor() {
    this.canvas = document.createElement("canvas");
    this.canvas.className = "block h-screen w-full";

    this.engine = new Engine(this.canvas);
    this.scene = new Scene(this.engine);

    this.light = new HemisphericLight(
      "hemispheric-light",
      new Vector3(0, 1, 0),
      this.scene,
    );

    this.scene.clearColor = Color4.FromHexString(getColors().scene);

    this.engine.runRenderLoop(this.render);
    window.addEventListener("resize", this.handleResize);

    this.removeAppearanceListener = watchAppearance(this.handleAppearance);
  }

  dispose() {
    this.removeAppearanceListener();
    window.removeEventListener("resize", this.handleResize);
    this.scene.dispose();
    this.engine.dispose();
    this.canvas.remove();
  }

  attachTo(container: HTMLElement) {
    container.append(this.canvas);
    this.engine.resize();
  }

  getMeshById(id: string) {
    const mesh = this.scene.getMeshById(id);
    const shapeMesh = mesh?.metadata?.shapeMesh;
    if (shapeMesh instanceof ShapeMesh) return shapeMesh;
  }

  createMesh(shape: Shape) {
    new ShapeMesh(shape, this.scene);
  }

  updateMesh(shape: Shape) {
    const mesh = this.getMeshById(shape.id);
    if (mesh) mesh.update(shape);
  }

  deleteMesh(id: string) {
    this.getMeshById(id)?.dispose();
  }

  getMeshes() {
    return this.scene.meshes
      .filter(ShapeMesh.only)
      .map((s) => s.metadata.shapeMesh as ShapeMesh);
  }

  private handleResize = () => {
    this.engine.resize();
  };

  private render = () => {
    this.scene.render();
  };

  private handleAppearance = (colors: Colors) => {
    this.scene.clearColor = Color4.FromHexString(colors.scene);
  };
}
