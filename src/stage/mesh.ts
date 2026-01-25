import "@babylonjs/core/Rendering/edgesRenderer";

import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { InstancedMesh } from "@babylonjs/core/Meshes/instancedMesh";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import type { Scene } from "@babylonjs/core/scene";

import type { MeshFilter, Shape } from "$/types";
import { getCenter, getDimensions } from "$/utils/bounds";
import { getColors } from "$/utils/colors";

const epsilon = 1e-3;
const sourceMeshesByColor = new Map<string, Mesh>();

export class ShapeMesh {
  static only: MeshFilter = (mesh): mesh is InstancedMesh =>
    mesh instanceof InstancedMesh &&
    mesh.metadata?.shapeMesh instanceof ShapeMesh;

  static visible: MeshFilter = (mesh): mesh is InstancedMesh =>
    ShapeMesh.only(mesh) && !mesh.metadata.shapeMesh.cutOff;

  static selectable: MeshFilter = (mesh): mesh is InstancedMesh =>
    ShapeMesh.only(mesh) && mesh.metadata.shapeMesh.isSelectable();

  static get = (mesh: AbstractMesh | undefined | null) => {
    const shapeMesh = mesh?.metadata?.shapeMesh;
    if (shapeMesh instanceof ShapeMesh) return shapeMesh;
  };

  id: string;
  source!: Mesh;
  instance!: InstancedMesh;
  scene: Scene;

  shape!: Shape;
  selected: boolean;
  locked: boolean;
  cutOff: boolean;

  static getSource(color: string, scene: Scene): Mesh {
    let source = sourceMeshesByColor.get(color);
    if (source) return source;

    const material = new StandardMaterial(`mat_${color}`, scene);
    material.specularColor = Color3.Black();
    material.diffuseColor = Color3.FromHexString(color);

    source = MeshBuilder.CreateBox(`box_${color}`, { size: 1 }, scene);
    source.material = material;
    source.isVisible = false;

    sourceMeshesByColor.set(color, source);
    return source;
  }

  constructor(shape: Shape, scene: Scene) {
    this.id = shape.id;
    this.scene = scene;

    this.selected = false;
    this.locked = false;
    this.cutOff = false;

    this.update(shape);
  }

  dispose() {
    this.instance.dispose();
  }

  update(shape: Shape) {
    // only update when reference shape object has changed
    if (shape === this.shape) return;

    if (shape.color !== this.shape?.color) {
      this.instance?.dispose();
      this.source = ShapeMesh.getSource(shape.color, this.scene);
      this.instance = this.source.createInstance(shape.id);
      this.instance.metadata = { shapeMesh: this };
      this.instance.checkCollisions = true;
    }

    this.shape = shape;

    const center = getCenter(shape);
    const size = getDimensions(shape);

    if (size.x === 0) size.x = epsilon;
    if (size.y === 0) size.y = epsilon;
    if (size.z === 0) size.z = epsilon;

    this.instance.position.copyFrom(center);
    this.instance.scaling.copyFrom(size);

    this.updateEdges();
    this.setSelected(this.selected);
    this.setLocked(shape.locked);
  }

  isSelected() {
    return this.selected;
  }

  isSelectable() {
    return this.instance.isPickable && !this.locked && !this.cutOff;
  }

  isVisible() {
    return this.instance.isVisible && !this.cutOff;
  }

  isGroup(group: string | undefined) {
    return this.shape.group === group;
  }

  setEnabled(enabled: boolean) {
    this.instance.setEnabled(enabled);
  }

  setSelected(selected: boolean) {
    if (this.selected === selected) return;

    const color = selected ? getColors().ghost : this.shape.color;

    this.instance.edgesColor = Color4.FromHexString(color);
    this.instance.edgesWidth = selected ? 8 : 4;
    this.selected = selected;
    this.instance.renderOutline = false;
  }

  setLocked(locked: boolean) {
    if (this.locked === locked) return;

    this.instance.renderOutline = false;
    this.locked = locked;
  }

  setHighlight(highlighted: boolean) {
    if (this.instance.renderOutline === highlighted) return;

    this.instance.renderOutline = highlighted;
    this.instance.outlineWidth = highlighted ? 1 : 0;
    this.instance.outlineColor = Color3.FromHexString(getColors().ghost);
  }

  setCutOff(maxY: number) {
    const { position, height } = this.shape;

    if (position.y >= maxY) {
      this.instance.setEnabled(false);
      this.cutOff = true;
    } else if (position.y + height >= maxY) {
      this.instance.setEnabled(true);
      this.instance.position.y = position.y + 0.5;
      this.instance.scaling.y = 1;
      this.cutOff = true;
    } else {
      this.instance.position.y = getCenter(this.shape).y;
      this.instance.scaling.y = Math.max(this.shape.height, epsilon);
      this.instance.setEnabled(true);
      this.cutOff = false;
    }
  }

  private updateEdges() {
    this.instance.disableEdgesRendering();
    this.instance.enableEdgesRendering();

    if (!this.selected) {
      this.instance.edgesColor = Color4.FromHexString(this.shape.color);
      this.instance.edgesWidth = 4;
    }
  }
}
