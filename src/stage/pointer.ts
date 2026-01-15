import { Vector2 } from "@babylonjs/core";

import type { View } from "$/stage/view";

type Button = "left" | "middle" | "right" | "back" | "forward";
type Type = "click" | "dblclick" | "move" | "drag-start" | "drag" | "drag-end";
type PointerEventType = `${Button}-${Type}`;

export interface DragInfo {
  type: PointerEventType;
  event: PointerEvent;
  start: Vector2;
  last: Vector2;
  position: Vector2;
  offset: Vector2;
  delta: Vector2;
}

export interface ClickInfo {
  type: PointerEventType;
  event: PointerEvent;
  position: Vector2;
}

export interface MoveInfo {
  type: "move";
  event: PointerEvent;
  position: Vector2;
}

export interface WheelInfo {
  type: "wheel";
  event: WheelEvent;
  wheel: number;
}

export type PointerInfo = DragInfo | ClickInfo | MoveInfo | WheelInfo;

export type PointerCallback = (info: PointerInfo) => void;

export class Pointer {
  view: View;
  activePointerId?: number;

  drag = false; //

  start?: Vector2; // pointer position on drag action first event
  last?: Vector2; // last pointer position on drag action
  position?: Vector2; // current pointer position
  travel?: Vector2; // total distance travelled since drag start
  delta?: Vector2; // distance travelled since last drag event

  private lastClickTime = 0;

  onInteraction: PointerCallback;

  constructor(view: View, onInteraction: PointerCallback) {
    this.view = view;
    this.onInteraction = onInteraction;

    this.view.canvas.addEventListener("pointerdown", this.handlePointerDown);
    this.view.canvas.addEventListener("wheel", this.handleWheel);

    window.addEventListener("pointermove", this.handlePointerMove);
  }

  dispose() {
    this.view.canvas.removeEventListener("pointerdown", this.handlePointerDown);
    this.view.canvas.removeEventListener("wheel", this.handleWheel);

    window.removeEventListener("pointermove", this.handlePointerMove);
  }

  handlePointerDown = (event: PointerEvent) => {
    if (this.activePointerId !== undefined) return;

    this.activePointerId = event.pointerId;

    this.start = new Vector2(event.clientX, event.clientY);
    this.last = this.start.clone();
    this.position = this.start.clone();
    this.travel = Vector2.Zero();
    this.delta = Vector2.Zero();

    const lastTime = this.lastClickTime;
    this.lastClickTime = event.timeStamp;

    if (event.timeStamp - lastTime < 200) {
      this.forward("dblclick", event);
      this.activePointerId = undefined;
      return;
    }

    window.addEventListener("pointermove", this.handleDrag);
    window.addEventListener("pointerup", this.handleDragEnd);
  };

  handlePointerMove = (event: PointerEvent) => {
    const position = new Vector2(event.clientX, event.clientY);
    this.onInteraction({ type: "move", event, position });
  };

  handleWheel = (event: WheelEvent) => {
    const platformScale =
      event.deltaMode === WheelEvent.DOM_DELTA_LINE ? 40 : 1;
    const wheel = -(event.deltaY * platformScale);
    this.onInteraction({ type: "wheel", event, wheel });
  };

  handleDrag = (event: PointerEvent) => {
    if (event.pointerId !== this.activePointerId) return;

    this.last = this.position;
    this.position = new Vector2(event.clientX, event.clientY);
    this.travel = this.position!.subtract(this.start!);
    this.delta = this.position!.subtract(this.last!);

    if (this.travel.lengthSquared() > 8 && !this.drag) {
      this.drag = true;
      this.forward("drag-start", event);
    }

    if (this.drag) {
      this.forward("drag", event);
    }
  };

  handleDragEnd = (event: PointerEvent) => {
    if (event.pointerId !== this.activePointerId) return;

    if (this.drag) {
      this.forward("drag-end", event);
    } else {
      this.forward("click", event);
    }

    this.activePointerId = undefined;

    this.start = undefined;
    this.position = undefined;
    this.delta = undefined;
    this.drag = false;

    window.removeEventListener("pointermove", this.handleDrag);
    window.removeEventListener("pointerup", this.handleDragEnd);
  };

  forward(type: Type, event: PointerEvent) {
    let button: Button | undefined;
    if (event.button === 0 || event.buttons === 1) button = "left";
    if (event.button === 1 || event.buttons === 4) button = "middle";
    if (event.button === 2 || event.buttons === 2) button = "right";
    if (event.button === 3 || event.buttons === 8) button = "back";
    if (event.button === 4 || event.buttons === 16) button = "forward";
    if (!button) return;

    if (type === "click" || type === "dblclick") {
      return this.onInteraction({
        event,
        type: `${button}-${type}`,
        position: this.position!.clone(),
      });
    }

    return this.onInteraction({
      event,
      type: `${button}-${type}`,
      start: this.start!.clone(),
      last: this.last!.clone(),
      position: this.position!.clone(),
      offset: this.travel!.clone(),
      delta: this.delta!.clone(),
    });
  }
}
