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
    this.grid.setLayer(this.grid.layer + 1);
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
    this.grid.setLayer(this.grid.layer - 1);
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
    const level = Math.floor(this.grid.layer / this.grid.height);
    this.grid.setLevel(level + 1);
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
    const level = Math.ceil(this.grid.layer / this.grid.height);
    this.grid.setLevel(level - 1);
  }
}
