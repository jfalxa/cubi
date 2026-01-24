import { Vector3 } from "@babylonjs/core";

import type { CameraStore } from "$/stores/camera.svelte";
import type { GridStore } from "$/stores/grid.svelte";

import type { Command } from ".";

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
    this.shiftCamera(this.shift);
  }

  private shiftCamera(deltaLevel: number) {}
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
