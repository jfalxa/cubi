import type { Vector2 } from "@babylonjs/core";

import type { Stage } from "$/stage";
import { Grid } from "$/stage/grid";
import {
  createIntent,
  hasShift,
  type Context,
  type Intent,
} from "$/stage/interactions";
import { ShapeMesh } from "$/stage/mesh";
import type { ClickInfo } from "$/stage/pointer";
import { areShapesConnected } from "$/utils/bounds";

import type { Tool } from ".";

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
        const multiple = hasShift(context);
        if (context.locked) return;
        if (this.pick(context.info.position, multiple)) return SelectIntent;
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

  pick(position: Vector2, multiple = false) {
    const picked = this.stage.pick(position, (mesh) => {
      if (multiple) return ShapeMesh.selectable(mesh);
      else return Grid.only(mesh) || ShapeMesh.selectable(mesh);
    });

    return ShapeMesh.get(picked.pickedMesh);
  }

  selectAt(position: Vector2, multiple = false) {
    const picked = this.pick(position, multiple)!.id;

    if (multiple) {
      this.toggle(picked);
    } else {
      this.set([picked]);
    }
  }

  selectConnectedAt(position: Vector2, multiple = false) {
    const picked = this.pick(position)!;

    const meshes = new Set(
      this.stage.view.getMeshes().filter((m) => m.isSelectable()),
    );

    const stack = [picked];
    const connected = [picked.id];

    while (stack.length > 0) {
      const ref = stack.pop()!;

      for (const mesh of meshes) {
        if (areShapesConnected(ref.shape, mesh.shape)) {
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

        const shape = mesh.shape;
        if (!shape.group) return [shape.id];

        return this.stage.view
          .getMeshes()
          .map((m) => m.shape)
          .filter((s) => s.group === shape.group)
          .map((s) => s.id);
      }),
    );
  }

  private notify() {
    this.onSelect(Array.from(this.selected));
  }
}
