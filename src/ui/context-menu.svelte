<script lang="ts">
  import { ContextMenu } from "bits-ui";
  import type { Vector2 } from "@babylonjs/core/Maths/math.vector";

  import type { AvailableCommand } from "$/commands";
  import { groupBy } from "$/utils/collection";

  import CommandMenu from "./command-menu.svelte";

  type Props = {
    position?: Vector2;
    commands: AvailableCommand[];
  };

  let { commands, position }: Props = $props();

  let open = $state(false);

  let hasCommands = $derived(commands.some((c) => !c.isDisabled()));

  $effect(() => {
    open = position !== undefined && commands.length > 0;
  });

  const customAnchor = {
    getBoundingClientRect() {
      return DOMRect.fromRect({
        x: position?.x ?? 0,
        y: position?.y ?? 0,
        width: 0,
        height: 0,
      });
    },
  };

  function preventNativeContextMenu(e: Event) {
    if (open) e.preventDefault();
  }
</script>

<svelte:document oncontextmenu={preventNativeContextMenu} />

{#if hasCommands}
  <ContextMenu.Root bind:open>
    <ContextMenu.Portal>
      <ContextMenu.Content
        {customAnchor}
        class="surface w-48 overflow-hidden rounded-sm p-1 outline-none"
      >
        <CommandMenu hideDisabled {commands} />
      </ContextMenu.Content>
    </ContextMenu.Portal>
  </ContextMenu.Root>
{/if}
