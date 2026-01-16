import { Vector2, Vector3 } from "@babylonjs/core";

import type { Stage } from "$/stage";
import { createIntent, type Context, type Intent } from "$/stage/interactions";
import type { DragInfo } from "$/stage/pointer";
import type { Shape } from "$/types";
import { getBoundingBox } from "$/utils/bounds";
import { getElevation, getGridPoint } from "$/utils/rays";

import type { Tool } from ".";
import { ShapeMesh } from "$/stage/mesh";

const StartMoveIntent = createIntent("start-move");
const MoveIntent = createIntent("move");
const EndMoveIntent = createIntent("end-move");

interface MoveCallbacks {
  onMoveStart: () => Shape[];
  onMoveEnd: () => void;
  onMove: (shapes: Shape[]) => void;
}

export class MoveTool implements Tool {
  stage: Stage;

  private active: boolean;
  private snapshot: Shape[];
  private vertical: boolean;

  private onMoveStart: MoveCallbacks["onMoveStart"];
  private onMove: MoveCallbacks["onMove"];
  private onMoveEnd: MoveCallbacks["onMoveEnd"];

  constructor(stage: Stage, callbacks: MoveCallbacks) {
    this.stage = stage;
    this.active = false;
    this.vertical = false;
    this.snapshot = [];

    this.onMoveStart = callbacks.onMoveStart;
    this.onMove = callbacks.onMove;
    this.onMoveEnd = callbacks.onMoveEnd;

    this.stage.interactions.register(this);
  }

  dispose() {
    this.stage.interactions.unregister(this);
  }

  proposeIntent(context: Context) {
    switch (context.info.type) {
      case "left-drag-start": {
        if (!this.isOnSelectedShape(context.info.position)) return;
        return StartMoveIntent;
      }

      case "left-drag": {
        if (!this.active) return;
        if (this.snapshot.length === 0) return;
        return MoveIntent;
      }

      case "left-drag-end": {
        if (!this.active) return;
        return EndMoveIntent;
      }
    }
  }

  applyIntent(intent: Intent, context: Context) {
    switch (intent) {
      case StartMoveIntent: {
        return this.handleMoveStart(context.info as DragInfo);
      }

      case MoveIntent: {
        return this.handleMove(context.info as DragInfo);
      }

      case EndMoveIntent: {
        return this.handleMoveEnd();
      }
    }
  }

  private isOnSelectedShape(position: Vector2) {
    const mesh = this.stage.pickShape(position, ShapeMesh.only);
    return mesh?.isSelected() ?? false;
  }

  private moveShapes(travel: Vector3) {
    this.onMove(
      this.snapshot.map((shape) => ({
        ...shape,
        position: shape.position.add(travel),
      }))
    );
  }

  private handleMoveStart = (info: DragInfo) => {
    this.active = true;
    this.vertical = info.event.shiftKey;
    this.snapshot = this.onMoveStart();
  };

  private handleMove = (info: DragInfo) => {
    if (this.vertical) return this.handleMoveVertical(info);
    else return this.handleMoveHorizontal(info);
  };

  private handleMoveHorizontal = (info: DragInfo) => {
    const { camera, grid } = this.stage;

    const start = getGridPoint(info.start, camera, grid);
    const current = getGridPoint(info.position, camera, grid);

    if (!start || !current) return;

    this.moveShapes(current.subtract(start));
  };

  private handleMoveVertical = (info: DragInfo) => {
    const { camera, grid } = this.stage;
    const [reference] = this.snapshot;

    const start = getElevation(info.start, camera, reference);
    const current = getElevation(info.position, camera, reference);

    const minY = getBoundingBox(this.snapshot).min.y;
    const travelY = Math.max(current - start, -minY);

    this.moveShapes(new Vector3(0, travelY, 0));
  };

  private handleMoveEnd = () => {
    this.active = false;
    this.vertical = false;
    this.onMoveEnd();
  };
}
