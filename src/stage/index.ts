import type { Vector2 } from "@babylonjs/core";

import type { MeshFilter } from "$/types";

import { BoundingBox } from "./bounding-box";
import { Camera } from "./camera";
import { Grid } from "./grid";
import { Interactions } from "./interactions";
import { View } from "./view";

export class Stage {
  view: View;
  interactions: Interactions;
  camera: Camera;
  grid: Grid;
  boundingBox: BoundingBox;

  constructor() {
    this.view = new View();
    this.interactions = new Interactions(this);
    this.camera = new Camera(this.view, this.interactions);
    this.grid = new Grid(this.view);
    this.boundingBox = new BoundingBox(this.view.scene);
  }

  mount(container: HTMLElement) {
    this.view.attachTo(container);
  }

  dispose() {
    this.boundingBox.dispose();
    this.grid.dispose();
    this.camera.dispose();
    this.interactions.dispose();
    this.view.dispose();
  }

  pick(position: Vector2, predicate?: MeshFilter) {
    return this.view.scene.pick(
      position.x,
      position.y,
      predicate,
      false,
      this.camera,
    );
  }
}
