import type { GridStore } from "$/stores/grid.svelte";

import type { Command } from ".";

export class GridSettingsCommand implements Command {
  label = "Grid settings";
  group = "grid";

  constructor(private grid: GridStore) {}

  isAvailable() {
    return true;
  }

  execute(): void {
    this.grid.showGridForm = true;
  }
}
