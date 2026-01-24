import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Observer } from "@babylonjs/core/Misc/observable";
import type { Scene } from "@babylonjs/core/scene";

import {
  createIntent,
  hasCtrl,
  hasShift,
  type Context,
  type Intent,
  type Interactions,
  type Interactive,
} from "./interactions";
import type { DragInfo, WheelInfo } from "./pointer";
import type { View } from "./view";

const CameraPanIntent = createIntent("camera-pan");
const CameraRotateIntent = createIntent("camera-rotate");
const CameraZoomIntent = createIntent("camera-zoom");

const MIN_CAMERA_RADIUS = 0.001;
const WHEEL_DELTA_SCALE = 40;
const MAX_WHEEL_DELTA = 0.2;
const ZOOM_RESPONSE = 0.05;
const TRACKPAD_ZOOM_SCALE = 0.25;
const TRACKPAD_DELTA_THRESHOLD = 50;

export class Camera extends ArcRotateCamera implements Interactive {
  view: View;
  interactions: Interactions;

  private zoomObserver: Observer<Scene>;

  constructor(view: View, interactions: Interactions) {
    super("camera", 0, 0, 0, Vector3.Zero(), view.scene);

    this.view = view;
    this.interactions = interactions;

    this.lowerRadiusLimit = 4;
    this.upperRadiusLimit = null;

    this.zoomObserver = this.view.scene.onBeforeRenderObservable.add(
      this.adaptPanningSensibility,
    );

    this.interactions.register(this);
  }

  override dispose(): void {
    this.view.scene.onBeforeRenderObservable.remove(this.zoomObserver);
    this.interactions.unregister(this);
    super.dispose();
  }

  proposeIntent(context: Context): Intent | undefined {
    switch (context.info.type) {
      case "left-drag": {
        if (hasCtrl(context) && hasShift(context)) return CameraRotateIntent;
        if (hasCtrl(context)) return CameraPanIntent;
        break;
      }

      case "middle-drag": {
        return CameraPanIntent;
      }

      case "right-drag": {
        return CameraRotateIntent;
      }

      case "wheel": {
        return CameraZoomIntent;
      }
    }
  }

  applyIntent(intent: Intent, context: Context) {
    switch (intent) {
      case CameraPanIntent: {
        return this.handlePan(context.info as DragInfo);
      }

      case CameraRotateIntent: {
        return this.handleRotate(context.info as DragInfo);
      }

      case CameraZoomIntent: {
        return this.handleZoom(context.info as WheelInfo);
      }
    }
  }

  private handlePan = (info: DragInfo) => {
    if (this.panningSensibility !== 0) {
      this.inertialPanningX += -info.delta.x / this.panningSensibility;
      this.inertialPanningY += info.delta.y / this.panningSensibility;
    }
  };

  private handleRotate = (info: DragInfo) => {
    this.inertialAlphaOffset -= info.delta.x / this.angularSensibilityX;
    this.inertialBetaOffset -= info.delta.y / this.angularSensibilityY;
  };

  private handleZoom = (info: WheelInfo) => {
    info.event.preventDefault();

    const isPixelDelta =
      info.event.deltaMode === WheelEvent.DOM_DELTA_PIXEL &&
      Math.abs(info.event.deltaY) < TRACKPAD_DELTA_THRESHOLD;

    const inputScale = isPixelDelta ? TRACKPAD_ZOOM_SCALE : 1;

    const rawDelta =
      (info.wheel * inputScale) / (this.wheelPrecision * WHEEL_DELTA_SCALE);

    const delta = Math.max(
      Math.min(rawDelta, MAX_WHEEL_DELTA),
      -MAX_WHEEL_DELTA,
    );

    const radius = Math.max(this.radius, MIN_CAMERA_RADIUS);
    const zoomFactor = Math.exp(delta * ZOOM_RESPONSE);

    this.inertialRadiusOffset += radius * (zoomFactor - 1);
  };

  private adaptPanningSensibility = () => {
    const radius = Math.max(this.radius, MIN_CAMERA_RADIUS);
    this.panningSensibility = 10000 / radius;
  };
}
