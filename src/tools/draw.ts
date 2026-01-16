import { Vector2, Vector3 } from "@babylonjs/core";

import type { Stage } from "$/stage";
import { createIntent, type Context, type Intent } from "$/stage/interactions";
import { ShapeMesh } from "$/stage/mesh";
import type { MoveInfo } from "$/stage/pointer";
import type { PartialShape, Shape } from "$/types";
import { getGridElevation, getGridPoint } from "$/utils/rays";
import {
  cloneShape,
  createShape,
  isValid,
  normalizeShape,
} from "$/utils/shape";

import type { Tool } from ".";
import { getColors } from "$/colors";

const DrawIntent = createIntent("draw");
const CommitDrawIntent = createIntent("commit-draw");
const RevertDrawIntent = createIntent("revert-draw");

export type DrawState = "idle" | "base" | "elevation";

interface DrawCallbacks {
  onDraw: (shape: Shape, position: Vector2) => void;
  onCommit: (shape: Shape) => void;
  onCancel: () => void;
}

export class DrawTool implements Tool {
  stage: Stage;

  shape: Shape;
  ghost: ShapeMesh;

  state: DrawState = "idle";

  onDraw: DrawCallbacks["onDraw"];
  onCommit: DrawCallbacks["onCommit"];
  onCancel: DrawCallbacks["onCancel"];

  constructor(stage: Stage, callbacks: DrawCallbacks) {
    this.stage = stage;

    this.shape = createShape({ id: "ghost", color: getColors().ghost });

    this.ghost = new ShapeMesh(this.shape, this.stage.view.scene, true);
    this.ghost.setEnabled(false);

    this.onDraw = callbacks.onDraw;
    this.onCommit = callbacks.onCommit;
    this.onCancel = callbacks.onCancel;

    this.stage.interactions.register(this);
  }

  dispose() {
    this.ghost.dispose();
    this.stage.interactions.unregister(this);
  }

  proposeIntent(context: Context) {
    switch (context.info.type) {
      case "move": {
        return DrawIntent;
      }

      case "left-click": {
        return CommitDrawIntent;
      }

      case "right-click": {
        if (this.state === "idle") return;
        return RevertDrawIntent;
      }
    }
  }

  applyIntent(intent: Intent, context: Context) {
    switch (intent) {
      case DrawIntent: {
        return this.handleMove(context.info as MoveInfo);
      }

      case CommitDrawIntent: {
        return this.handleCommit();
      }

      case RevertDrawIntent: {
        return this.handleRevert();
      }
    }
  }

  reset() {
    this.state = "idle";
    this.stage.interactions.locked = false;
    this.ghost.setEnabled(false);
    this.update({ position: Vector3.Zero(), width: 0, height: 0, depth: 0 });
    this.onCancel();
  }

  update(shape: PartialShape) {
    this.shape = { ...this.shape, ...shape };
    this.ghost.update(this.shape);
  }

  handleCommit = () => {
    switch (this.state) {
      case "idle": {
        this.state = "base";
        this.ghost.setEnabled(true);
        return true;
      }

      case "base": {
        this.state = "elevation";
        return true;
      }

      case "elevation": {
        const clone = cloneShape(this.shape, { color: "#dcdcdc" });
        const normalized = normalizeShape(clone);
        if (isValid(normalized)) this.onCommit(normalized);
        this.reset();
        return false;
      }
    }
  };

  handleRevert = () => {
    switch (this.state) {
      case "base": {
        this.reset();
        return false;
      }

      case "elevation": {
        this.state = "base";
        this.update({ height: 0 });
        return true;
      }
    }
  };

  handleMove = (info: MoveInfo) => {
    const { camera, grid } = this.stage;

    switch (this.state) {
      case "idle": {
        const position = getGridPoint(info.position, camera, grid);
        if (!position) break;
        this.update({ position, width: 0, height: 0, depth: 0 });
        break;
      }

      case "base": {
        const position = getGridPoint(info.position, camera, grid);
        if (!position) break;
        const distance = position.subtract(this.shape.position);
        this.update({ width: distance.x, depth: distance.z });
        this.onDraw(normalizeShape(this.shape), info.position);
        break;
      }

      case "elevation": {
        const height = getGridElevation(
          info.position,
          camera,
          grid,
          this.shape
        );
        this.update({ height });
        this.onDraw(normalizeShape(this.shape), info.position);
        break;
      }
    }
  };
}
