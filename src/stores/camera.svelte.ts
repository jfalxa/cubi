import { onMount } from "svelte";
import { Vector3 } from "@babylonjs/core";

import type { Camera } from "$/stage/camera";

const DEFAULT_FOV = 0.8;
const FIT_PADDING = 1.1;

interface CameraInit {
  position?: Vector3;
  target?: Vector3;
}

export class CameraStore {
  position = $state(Vector3.Zero());
  target = $state(Vector3.Zero());

  constructor(init?: CameraInit) {
    this.position = init?.position ?? CameraStore.defaultPosition();
    this.target = init?.target ?? Vector3.Zero();
  }

  static defaultPosition() {
    const isometricDirection = new Vector3(1, 1, -1).normalize();
    return isometricDirection.scale(100);
  }

  scale(ratio: number) {
    this.target = this.target.scale(ratio);
    this.position = this.position.scale(ratio);
  }

  reset() {
    this.position = CameraStore.defaultPosition();
    this.target = Vector3.Zero();
  }

  fit(width: number, height: number, depth: number) {
    const radius = 0.5 * Math.hypot(width, height, depth);
    const direction = CameraStore.defaultPosition().normalize();

    const distance =
      radius === 0
        ? CameraStore.defaultPosition().length()
        : (radius / Math.sin(DEFAULT_FOV / 2)) * FIT_PADDING;

    this.position = direction.scale(distance);
    this.target = new Vector3(0, height / 2, 0);
  }
}

export function useCameraSync(cameraStore: CameraStore, camera: Camera) {
  // sync store to camera
  $effect(() => {
    if (!camera.position.equals(cameraStore.position)) {
      camera.setPosition(cameraStore.position);
    }

    if (!camera.target.equals(cameraStore.target)) {
      camera.setTarget(cameraStore.target);
    }
  });

  // sync camera to store
  onMount(() => {
    const observer = camera.onViewMatrixChangedObservable.add(() => {
      if (!cameraStore.position.equals(camera.position)) {
        cameraStore.position = camera.position.clone();
      }

      if (!cameraStore.target.equals(camera.target)) {
        cameraStore.target = camera.target.clone();
      }
    });

    return () => {
      camera.onViewMatrixChangedObservable.remove(observer);
    };
  });
}
