import type { MenuStore } from "$/stores/context-menu.svelte";

import type { Command } from ".";

export class NewCommand implements Command {
  label = "New";
  group = "file";

  shortcuts = ["ctrl+n", "command+n"];

  constructor(private menu: MenuStore) {}

  isAvailable() {
    return true;
  }

  execute(): void {
    this.menu.showNewDialog = true;
  }
}
