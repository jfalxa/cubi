import {
  Color3,
  Mesh,
  MeshBuilder,
  Scene,
  StandardMaterial,
  Vector3,
} from "@babylonjs/core";

import type { Stage } from "$/stage";
import type { BBox, Bounds, Shape } from "$/types";

import { getBBox, hasOverlap } from "../utils/bounds";
import { groupBy } from "../utils/collection";
import { getColors } from "../utils/colors";

export type Axis = "x" | "y" | "z";
export type Feature = "min" | "center" | "max";

export type Faces<T> = Record<Axis, Record<Feature, T>>;

export const AXES: Axis[] = ["x", "y", "z"];
export const FEATURES: Feature[] = ["min", "center", "max"];

const epsilon = 1e-1;

export class Alignment {
  stage: Stage;

  others: BBox[];
  guides: Faces<Mesh>;

  constructor(stage: Stage) {
    this.stage = stage;
    this.others = [];
    this.guides = Alignment.createGuides(this.stage.view.scene);
  }

  static createGuides(scene: Scene) {
    const guides = { x: {}, y: {}, z: {} } as Faces<Mesh>;

    const material1 = new StandardMaterial("guide_material");
    material1.specularColor = Color3.Black();
    material1.diffuseColor = Color3.FromHexString(getColors().guide);
    material1.alpha = 0.1;

    for (const axis of AXES) {
      for (const feature of FEATURES) {
        const guide = MeshBuilder.CreateBox(
          `${axis}_${feature}_guide`,
          { size: 1 },
          scene,
        );

        guide.material = material1;
        guide.isPickable = false;
        guide.setEnabled(false);
        guides[axis][feature] = guide;
      }
    }

    return guides;
  }

  start(selection: Shape[]) {
    const omit = new Set(selection.map((s) => s.id));
    const meshes = this.stage.view.getMeshes();
    const others = meshes.filter((s) => s.isVisible() && !omit.has(s.id));
    const shapes = others.map((s) => s.shape);
    const groups = Object.values(groupBy(shapes, (s) => s.group ?? s.id));
    this.others = groups.map(getBBox);
  }

  update(selection: Shape[]) {
    const alignement = this.getAlignment(selection);

    for (const axis of AXES) {
      for (const feature of FEATURES) {
        const guide = this.guides[axis][feature];
        const bounds = alignement[axis][feature];

        if (bounds !== undefined) {
          const center = Vector3.Center(bounds.min, bounds.max);
          const dimensions = bounds.max.subtract(bounds.min);

          if (dimensions.x === 0) dimensions.x = epsilon;
          if (dimensions.y === 0) dimensions.y = epsilon;
          if (dimensions.z === 0) dimensions.z = epsilon;

          guide.position.copyFrom(center);
          guide.scaling.copyFrom(dimensions);

          guide.setEnabled(true);
        } else {
          guide.setEnabled(false);
        }
      }
    }
  }

  stop() {
    for (const axis of AXES) {
      for (const feature of FEATURES) {
        const guide = this.guides[axis][feature];
        guide.setEnabled(false);
      }
    }
  }

  getAlignment(selection: Shape[]) {
    const alignement = { x: {}, y: {}, z: {} } as Faces<Bounds>;

    const a = getBBox(selection);
    const candidates = this.others.filter((other) => mayAlign(a, other));

    for (const b of candidates) {
      for (const axis of AXES) {
        for (const featA of FEATURES) {
          const tA = a[featA][axis];
          for (const featB of FEATURES) {
            const tB = b[featB][axis];

            if (Math.abs(tA - tB) < 1e-6) {
              const bounds = alignement[axis][featA] ?? {
                min: a.min.clone(),
                max: a.max.clone(),
              };

              bounds.min = Vector3.Minimize(bounds.min, b.min);
              bounds.max = Vector3.Maximize(bounds.max, b.max);

              bounds.min[axis] = tA;
              bounds.max[axis] = tA;

              alignement[axis][featA] = bounds;
            }
          }
        }
      }
    }

    return alignement;
  }
}

function mayAlign(a: BBox, b: BBox) {
  const x = hasOverlap("x", a, b);
  const y = hasOverlap("y", a, b);
  const z = hasOverlap("z", a, b);
  return (x && y) || (x && z) || (y && z);
}
