import type { Vector2 } from "@babylonjs/core";

import type { Stage } from "$/stage";
import type { Context, Intent } from "$/stage/interactions";
import { createIntent } from "$/stage/interactions";
import type { ClickInfo, MoveInfo } from "$/stage/pointer";
import { areShapesConnected, getBoundingBox } from "$/utils/bounds";

import type { Tool } from ".";
import type { Box } from "$/types";

const SelectIntent = createIntent("select");
const SelectConnectedIntent = createIntent("select-connected");
const ClearIntent = createIntent("clear");

export interface SelectionCallbacks {
  onSelect: (ids: string[]) => void;
}

export class SelectionTool implements Tool {
  stage: Stage;

  selected = new Set<string>();

  private onSelect: SelectionCallbacks["onSelect"];

  constructor(stage: Stage, callbacks: SelectionCallbacks) {
    this.stage = stage;
    this.onSelect = callbacks.onSelect;
    this.stage.interactions.register(this);
  }

  dispose() {
    this.clear();
    this.stage.interactions.unregister(this);
  }

  proposeIntent(context: Context) {
    switch (context.info.type) {
      case "left-click": {
        if (context.locked) return;
        if (this.pick(context.info.position)) return SelectIntent;
        if (this.selected.size > 0) return ClearIntent;
        break;
      }

      case "left-dblclick": {
        if (context.locked) return;
        if (!this.pick(context.info.position)) return;
        return SelectConnectedIntent;
      }
    }
  }

  applyIntent(intent: Intent, context: Context) {
    switch (intent) {
      case SelectIntent: {
        const info = context.info as ClickInfo;
        return this.selectAt(info.position, info.event.shiftKey);
      }

      case ClearIntent: {
        return this.clear();
      }

      case SelectConnectedIntent: {
        const info = context.info as ClickInfo;
        return this.selectConnectedAt(info.position, info.event.shiftKey);
      }
    }
  }

  equals(ids: string[]) {
    const sameSize = this.selected.size === ids.length;
    const sameContent = new Set(ids).difference(this.selected).size === 0;
    return sameSize && sameContent;
  }

  set(ids: string[]) {
    this.selected = this.getGroups(ids);
    this.notify();
  }

  add(...ids: string[]) {
    const groups = this.getGroups(ids);
    this.selected = this.selected.union(groups);
    this.notify();
  }

  remove(...ids: string[]) {
    const groups = this.getGroups(ids);
    this.selected = this.selected.difference(groups);
    this.notify();
  }

  toggle(id: string) {
    if (this.selected.has(id)) {
      this.remove(id);
    } else {
      this.add(id);
    }
  }

  clear() {
    this.set([]);
  }

  pick(position: Vector2) {
    return this.stage.pickShape(position);
  }

  selectAt(position: Vector2, multiple = false) {
    const picked = this.pick(position)!.id;

    if (multiple) {
      this.toggle(picked);
    } else {
      this.set([picked]);
    }
  }

  selectConnectedAt(position: Vector2, multiple = false) {
    const picked = this.pick(position)!;
    const meshes = new Set(this.stage.view.getMeshes());

    const stack = [picked];
    const connected = [picked.id];

    while (stack.length > 0) {
      const ref = stack.pop()!;

      for (const mesh of meshes) {
        if (areShapesConnected(ref.metadata.shape, mesh.metadata.shape)) {
          meshes.delete(mesh);
          connected.push(mesh.id);
          stack.push(mesh);
        }
      }
    }

    if (multiple) {
      this.add(...connected);
    } else {
      this.set(connected);
    }
  }

  getGroups(ids: string[]) {
    return new Set(
      ids.flatMap((id) => {
        const mesh = this.stage.view.getMeshById(id);
        if (!mesh) return [];

        const shape = mesh.metadata.shape;
        if (!shape.group) return [shape.id];

        return this.stage.view
          .getMeshes()
          .map((m) => m.metadata.shape)
          .filter((s) => s.group === shape.group)
          .map((s) => s.id);
      })
    );
  }

  private notify() {
    this.onSelect(Array.from(this.selected));
  }
}
