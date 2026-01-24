import type { Stage } from "$/stage";

import type { Command } from ".";

export class ToggleCameraCommand implements Command {
  label = "Toggle camera";
  group = "view";

  shortcuts = ["f"];

  constructor(private stage: Stage) {}

  isAvailable() {
    return true;
  }

  execute(): void {
    this.stage.toggleFirstPerson();
  }
}
