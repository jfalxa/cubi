import type { GridStore } from "$/stores/grid.svelte";

import type { Command } from ".";

export class LayerUpCommand implements Command {
  label = "Layer up";
  group = "grid";
  hidden = true;

  shortcuts = ["up"];

  constructor(private grid: GridStore) {}

  isAvailable() {
    return true;
  }

  execute(): void {
    this.grid.moveLayer(+1);
  }
}

export class LayerDownCommand implements Command {
  label = "Layer down";
  group = "grid";
  hidden = true;

  shortcuts = ["down"];

  constructor(private grid: GridStore) {}

  isAvailable() {
    return true;
  }

  execute(): void {
    this.grid.moveLayer(-1);
  }
}

export class LevelUpCommand implements Command {
  label = "Level up";
  group = "grid";
  hidden = true;

  shortcuts = ["shift+up"];

  constructor(private grid: GridStore) {}

  isAvailable() {
    return true;
  }

  execute(): void {
    this.grid.moveLayer(this.grid.level);
  }
}

export class LevelDownCommand implements Command {
  label = "Level down";
  group = "grid";
  hidden = true;

  shortcuts = ["shift+down"];

  constructor(private grid: GridStore) {}

  isAvailable() {
    return true;
  }

  execute(): void {
    this.grid.moveLayer(-this.grid.level);
  }
}
