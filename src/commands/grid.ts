import type { GridStore } from "$/stores/grid.svelte";

import type { Command } from ".";

export class GridCommand implements Command {
  label = "Grid";
  group = "grid";

  constructor(private grid: GridStore) {}

  isAvailable() {
    return true;
  }

  execute(): void {
    this.grid.showGridForm = true;
  }
}
