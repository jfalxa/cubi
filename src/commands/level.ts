import { Vector3 } from "@babylonjs/core/Maths/math.vector";

import type { CameraStore } from "$/stores/camera.svelte";
import type { GridStore } from "$/stores/grid.svelte";

import type { Command } from ".";

const CAMERA_FOV = 0.8;
const CAMERA_TILT_RATIO = 0.2;

class LevelCommand implements Command {
  label = "";
  group = "grid";
  hidden = true;
  shift = 0;

  constructor(
    private grid: GridStore,
    private camera: CameraStore,
  ) {}

  isAvailable() {
    return true;
  }

  execute(): void {
    const ratio = this.grid.layer / this.grid.height;
    const level = this.shift > 0 ? Math.floor(ratio) : Math.ceil(ratio);
    this.grid.setLevel(level + this.shift);
    this.shiftCamera(this.grid.level);
  }

  private shiftCamera(level: number) {
    const height = this.grid.height;

    const levelMin = level * height;
    const levelMax = levelMin + height;

    const target = this.camera.target.clone();
    const position = this.camera.position.clone();
    const distance = Vector3.Distance(position, target);
    if (distance <= 0) return;

    const halfSpan = Math.tan(CAMERA_FOV / 2) * distance;
    const viewMin = target.y - halfSpan;
    const viewMax = target.y + halfSpan;

    let delta = 0;
    if (levelMin < viewMin) {
      delta = levelMin - viewMin;
    } else if (levelMax > viewMax) {
      delta = levelMax - viewMax;
    }

    if (delta === 0) return;

    const shift = new Vector3(0, delta, 0);
    const newTarget = target.add(shift);

    const direction = position.subtract(target);
    const tilt = new Vector3(0, delta * CAMERA_TILT_RATIO, 0);
    const newDirection = direction.add(tilt).normalize().scale(distance);

    this.camera.target = newTarget;
    this.camera.position = newTarget.add(newDirection);
  }
}

export class LevelUpCommand extends LevelCommand {
  label = "Level up";
  shortcuts = ["shift+up"];
  shift = +1;
}

export class LevelDownCommand extends LevelCommand {
  label = "Level down";
  shortcuts = ["shift+down"];
  shift = -1;
}
