import type { Vector2 } from "@babylonjs/core";

import type { AvailableCommand } from "$/commands";

export class ContextMenuStore {
  commands = $state<AvailableCommand[]>([]);
  position = $state<Vector2>();
  showNewDialog = $state(false);

  update(commands: AvailableCommand[], position: Vector2) {
    this.commands = commands;
    this.position = position;
  }
}
