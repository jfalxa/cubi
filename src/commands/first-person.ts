import type { CameraStore } from "$/stores/camera.svelte";

import type { Command } from ".";

export class FirstPersonCommand implements Command {
  label = "First person view";
  group = "view";
  scopes = ["default", "first-person"];

  shortcuts = ["f"];

  constructor(private camera: CameraStore) {}

  isAvailable() {
    return true;
  }

  execute(): void {
    this.camera.toggleFirstPerson();
  }
}
