import type { Vector2 } from "@babylonjs/core";

import type { Stage } from "$/stage";
import { createIntent, type Context, type Intent } from "$/stage/interactions";
import { ShapeMesh } from "$/stage/mesh";
import type { ClickInfo } from "$/stage/pointer";

import type { Tool } from ".";

const ContextMenuIntent = createIntent("context-menu");

interface ContextMenuCallbacks {
  onContextMenu: (id: string | undefined, position: Vector2) => void;
}

export class ContextMenuTool implements Tool {
  stage: Stage;

  private onContextMenu: ContextMenuCallbacks["onContextMenu"];

  constructor(stage: Stage, callbacks: ContextMenuCallbacks) {
    this.stage = stage;
    this.onContextMenu = callbacks.onContextMenu;
    this.stage.interactions.register(this);
  }

  dispose() {
    this.stage.interactions.unregister(this);
  }

  proposeIntent(context: Context) {
    if (context.info.type === "right-click") {
      return ContextMenuIntent;
    }
  }

  applyIntent(intent: Intent, context: Context): boolean | void {
    if (intent === ContextMenuIntent) {
      const info = context.info as ClickInfo;
      const shape = this.stage.pick(info.position, ShapeMesh.visible);
      this.onContextMenu(shape.pickedMesh?.id, info.position);
    }
  }
}
