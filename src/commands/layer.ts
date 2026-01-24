import type { GridStore } from "$/stores/grid.svelte";

import type { Command } from ".";

class LayerCommand implements Command {
  label = "";
  group = "grid";
  hidden = true;

  shift = 0;

  constructor(private grid: GridStore) {}

  isAvailable() {
    return true;
  }

  execute(): void {
    this.grid.setLayer(this.grid.layer + this.shift);
  }
}

export class LayerUpCommand extends LayerCommand {
  label = "Layer up";
  shortcuts = ["up"];
  shift = +1;
}

export class LayerDownCommand extends LayerCommand {
  label = "Layer down";
  shortcuts = ["down"];
  shift = -1;
}
