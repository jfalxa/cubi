import type { Vector2 } from "@babylonjs/core/Maths/math.vector";

import type { AvailableCommand, Commands } from "$/commands";

export class MenuStore {
  general = $state<AvailableCommand[]>([]);
  context = $state<AvailableCommand[]>([]);

  position = $state<Vector2>();
  showNewDialog = $state(false);
}

export function useMenuSync(menuStore: MenuStore, commands: Commands) {
  $effect(() => {
    menuStore.general = commands.getGeneralCommands();
  });
}
