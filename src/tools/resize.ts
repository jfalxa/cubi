import { Vector2, Vector3 } from "@babylonjs/core";

import type { Stage } from "$/stage";
import { BoundingBox } from "$/stage/bounding-box";
import { Grid } from "$/stage/grid";
import {
  createIntent,
  hasAlt,
  type Context,
  type Intent,
} from "$/stage/interactions";
import type { DragInfo } from "$/stage/pointer";
import type { Box, Shape } from "$/types";
import { getBoundingBox } from "$/utils/bounds";
import { resizeShapes, scaleShapes } from "$/utils/geometry";
import { getAxisPoint } from "$/utils/rays";

import type { Tool } from ".";

const StartResizeIntent = createIntent("start-resize");
const ResizeIntent = createIntent("resize");
const EndResizeIntent = createIntent("end-resize");

interface ResizeCallbacks {
  onResizeStart: () => Shape[];
  onResizeEnd: () => void;
  onResize: (shapes: Shape[], box: Box, position: Vector2) => void;
}

export class ResizeTool implements Tool {
  stage: Stage;

  private active: boolean;
  private snapshot: Shape[];
  private anchor: Vector3;
  private axis: Vector3;

  private onResizeStart: ResizeCallbacks["onResizeStart"];
  private onResize: ResizeCallbacks["onResize"];
  private onResizeEnd: ResizeCallbacks["onResizeEnd"];

  static faces: Record<number, Vector3> = {
    0: Vector3.Forward(),
    1: Vector3.Backward(),
    2: Vector3.Right(),
    3: Vector3.Left(),
    4: Vector3.Up(),
    5: Vector3.Down(),
  };

  constructor(stage: Stage, callbacks: ResizeCallbacks) {
    this.stage = stage;
    this.active = false;
    this.snapshot = [];
    this.anchor = Vector3.Zero();
    this.axis = Vector3.Zero();

    this.onResizeStart = callbacks.onResizeStart;
    this.onResize = callbacks.onResize;
    this.onResizeEnd = callbacks.onResizeEnd;

    this.stage.interactions.register(this);
  }

  dispose() {
    this.stage.interactions.unregister(this);
  }

  proposeIntent(context: Context) {
    switch (context.info.type) {
      case "left-drag-start": {
        if (!hasAlt(context)) return;
        if (!this.pick(context.info.position).hit) return;
        return StartResizeIntent;
      }

      case "left-drag": {
        if (!this.active) return;
        return ResizeIntent;
      }

      case "left-drag-end": {
        if (!this.active) return;
        return EndResizeIntent;
      }
    }
  }

  applyIntent(intent: Intent, context: Context) {
    switch (intent) {
      case StartResizeIntent: {
        return this.handleResizeStart(context.info as DragInfo);
      }

      case ResizeIntent: {
        return this.handleResize(context.info as DragInfo);
      }

      case EndResizeIntent: {
        return this.handleResizeEnd();
      }
    }
  }

  pick(position: Vector2) {
    return this.stage.pick(position, BoundingBox.only);
  }

  private handleResizeStart = (info: DragInfo) => {
    this.active = true;
    this.snapshot = this.onResizeStart();

    const picked = this.pick(info.position);
    const face = Math.floor(picked.faceId / 2);
    const bbox = getBoundingBox(this.snapshot);

    this.axis = ResizeTool.faces[face];
    this.anchor = bbox.center.clone();

    switch (face) {
      case 0:
        this.anchor.z = bbox.min.z;
        break;
      case 1:
        this.anchor.z = bbox.max.z;
        break;
      case 2:
        this.anchor.x = bbox.min.x;
        break;
      case 3:
        this.anchor.x = bbox.max.x;
        break;
      case 4:
        this.anchor.y = bbox.min.y;
        break;
      case 5:
        this.anchor.y = bbox.max.y;
        break;
    }
  };

  private handleResize = (info: DragInfo) => {
    const { camera } = this.stage;

    const start = getAxisPoint(info.start, camera, this.anchor, this.axis);
    const current = getAxisPoint(info.position, camera, this.anchor, this.axis);

    const bbox = getBoundingBox(this.snapshot);
    const amount = Grid.snap(this.axis.multiply(current.subtract(start)));

    if (this.axis.y > 0) {
      amount.y = Math.max(amount.y, -bbox.max.y);
    } else if (this.axis.y < 0) {
      amount.y = Math.min(amount.y, bbox.min.y);
    }

    const resized = info.event.shiftKey
      ? scaleShapes(this.snapshot, amount, this.anchor)
      : resizeShapes(this.snapshot, amount, this.axis);

    this.onResize(resized, getBoundingBox(resized), info.position);
  };

  private handleResizeEnd = () => {
    this.active = false;
    this.onResizeEnd();
  };
}
