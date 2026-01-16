import type { Vector2 } from "@babylonjs/core";

import type { Stage } from "$/stage";
import type { Context, Intent } from "$/stage/interactions";
import { createIntent } from "$/stage/interactions";
import type { ClickInfo, MoveInfo } from "$/stage/pointer";
import { areShapesConnected, getBoundingBox } from "$/utils/bounds";

import type { Tool } from ".";
import type { Box } from "$/types";

const MeasureIntent = createIntent("measure");

export interface MeasureCallbacks {
  onMeasure: (box: Box, position: Vector2) => void;
  onNothing: () => void;
}

export class MeasureTool implements Tool {
  stage: Stage;

  selected = new Set<string>();

  private onMeasure: MeasureCallbacks["onMeasure"];
  private onNothing: MeasureCallbacks["onNothing"];

  constructor(stage: Stage, callbacks: MeasureCallbacks) {
    this.stage = stage;
    this.onMeasure = callbacks.onMeasure;
    this.onNothing = callbacks.onNothing;
    this.stage.interactions.register(this);
  }

  dispose() {
    this.stage.interactions.unregister(this);
  }

  proposeIntent(context: Context) {
    switch (context.info.type) {
      case "move": {
        if (context.locked) return;
        return MeasureIntent;
      }
    }
  }

  applyIntent(intent: Intent, context: Context) {
    switch (intent) {
      case MeasureIntent: {
        const info = context.info as MoveInfo;
        return this.handleMeasure(info.position);
      }
    }
  }

  handleMeasure(position: Vector2) {
    const meshes = this.stage.view.getMeshes();

    for (const mesh of meshes) {
      mesh.setHighlight(false);
    }

    const mesh = this.stage.pickShape(position);
    if (!mesh) return this.onNothing();

    const boxMeshes = [mesh];
    const group = mesh.metadata.shape.group;

    if (mesh.isSelected()) {
      boxMeshes.push(...meshes.filter((s) => s.isSelected()));
    } else if (group) {
      boxMeshes.push(...meshes.filter((s) => s.isGroup(group)));
    }

    for (const mesh of boxMeshes) {
      mesh.setHighlight(true);
    }

    const box = getBoundingBox(boxMeshes.map((s) => s.metadata.shape));
    this.onMeasure(box, position);
  }
}
