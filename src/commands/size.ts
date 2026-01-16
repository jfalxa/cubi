import type { GridStore } from "$/stores/grid.svelte";

import type { Command } from ".";

export class SizeCommand implements Command {
  label = "Grid size";
  group = "grid";

  constructor(private grid: GridStore) {}

  isAvailable() {
    return true;
  }

  execute(): void {
    this.grid.showGridForm = true;
  }
}
