import type { GridStore } from "$/stores/grid.svelte";

import type { Command } from ".";

export class LevelCommand implements Command {
  label = "Toggle level";
  group = "grid";

  shortcuts = ["space"];

  constructor(private grid: GridStore) {}

  isAvailable() {
    return true;
  }

  execute(): void {
    this.grid.cutOff = !this.grid.cutOff;
  }
}
