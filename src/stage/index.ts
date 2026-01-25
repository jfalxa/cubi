import type { Vector2 } from "@babylonjs/core/Maths/math.vector";

import type { MeshFilter } from "$/types";

import { Alignment } from "./align";
import { BoundingBox } from "./bounding-box";
import { Camera } from "./camera";
import { FirstPerson } from "./first-person";
import { Grid } from "./grid";
import { Interactions } from "./interactions";
import { View } from "./view";

export class Stage {
  view: View;
  interactions: Interactions;
  camera: Camera;
  firstPerson: FirstPerson;
  grid: Grid;
  boundingBox: BoundingBox;
  align: Alignment;

  constructor() {
    this.view = new View();
    this.interactions = new Interactions(this);
    this.camera = new Camera(this.view, this.interactions);
    this.grid = new Grid(this.view);
    this.firstPerson = new FirstPerson(this.view, this.grid, this.interactions);
    this.boundingBox = new BoundingBox(this.view.scene);
    this.align = new Alignment(this);

    this.view.scene.activeCamera = this.camera;
  }

  mount(container: HTMLElement) {
    this.view.attachTo(container);
  }

  dispose() {
    this.boundingBox.dispose();
    this.grid.dispose();
    this.firstPerson.dispose();
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
      this.getCamera(),
    );
  }

  getPointUnderPointer() {
    const { scene } = this.view;
    return scene.pick(scene.pointerX, scene.pointerY).pickedPoint;
  }

  getCamera() {
    if (this.firstPerson.active) return this.firstPerson.camera;
    return this.camera;
  }
}
