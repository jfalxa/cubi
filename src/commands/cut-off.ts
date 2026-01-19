import type { GridStore } from "$/stores/grid.svelte";

import type { Command } from ".";

export class CutOffCommand implements Command {
  label = "Toggle cut-off";
  group = "view";

  shortcuts = ["space"];

  constructor(private grid: GridStore) {}

  isAvailable() {
    return true;
  }

  execute(): void {
    this.grid.cutOff = !this.grid.cutOff;
  }
}
