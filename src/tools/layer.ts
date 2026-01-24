import { Vector3 } from "@babylonjs/core/Maths/math.vector";

import type { Stage } from "$/stage";
import { Grid } from "$/stage/grid";
import {
  createIntent,
  hasCtrl,
  type Context,
  type Intent,
} from "$/stage/interactions";
import { ShapeMesh } from "$/stage/mesh";
import type { ClickInfo } from "$/stage/pointer";

import type { Tool } from ".";

const LayerIntent = createIntent("layer");

export interface LayerCallbacks {
  onLayer: (layer: number) => void;
}

export class LayerTool implements Tool {
  stage: Stage;

  selected = new Set<string>();
  private onLayer: LayerCallbacks["onLayer"];

  constructor(stage: Stage, callbacks: LayerCallbacks) {
    this.stage = stage;
    this.onLayer = callbacks.onLayer;
    this.stage.interactions.register(this);
  }

  dispose() {
    this.stage.interactions.unregister(this);
  }

  proposeIntent(context: Context) {
    switch (context.info.type) {
      case "left-dblclick": {
        if (!hasCtrl(context)) return;
        return LayerIntent;
      }
    }
  }

  applyIntent(intent: Intent, context: Context) {
    switch (intent) {
      case LayerIntent: {
        return this.handleLayer(context.info as ClickInfo);
      }
    }
  }

  handleLayer = (info: ClickInfo) => {
    const picked = this.stage.pick(info.position, ShapeMesh.visible);

    const position = picked.pickedPoint
      ? Grid.snap(picked.pickedPoint)
      : Vector3.Zero();

    this.onLayer(Math.max(0, position.y));
  };
}
