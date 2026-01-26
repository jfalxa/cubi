<script lang="ts">
  import { DropdownMenu } from "bits-ui";

  import type { AvailableCommand } from "$/commands";

  import CommandMenu from "./command-menu.svelte";

  type Props = {
    commands: AvailableCommand[];
  };

  let { commands }: Props = $props();
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger class="fixed left-4 top-4">Menu</DropdownMenu.Trigger>
  <DropdownMenu.Portal>
    <DropdownMenu.Content
      class="surface w-48 overflow-hidden rounded-sm p-1 outline-none ml-4"
      sideOffset={2}
    >
      <CommandMenu {commands} />
    </DropdownMenu.Content>
  </DropdownMenu.Portal>
</DropdownMenu.Root>
