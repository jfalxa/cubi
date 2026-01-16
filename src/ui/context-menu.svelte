<script lang="ts">
  import { ContextMenu } from "bits-ui";
  import type { Vector2 } from "@babylonjs/core";

  import type { AvailableCommand } from "$/commands";
  import { groupBy } from "$/utils/collection";
  import ColorMenu from "./color-menu.svelte";

  type Props = {
    position?: Vector2;
    commands: AvailableCommand[];
  };

  let { commands, position }: Props = $props();

  let open = $state(false);
  let grouped = $derived(groupBy(commands, (cmd) => cmd.group));

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

<ContextMenu.Root bind:open>
  <ContextMenu.Portal>
    <ContextMenu.Content
      {customAnchor}
      class="surface w-48 overflow-hidden rounded-sm p-1 outline-none"
    >
      {#each Object.keys(grouped) as group}
        {#each grouped[group] as cmd}
          {#if cmd.label == "Colors"}
            <ColorMenu command={cmd} />
          {:else}
            <ContextMenu.Item
              onclick={() => cmd.action()}
              class="highlight cursor-pointer rounded-sm px-3 py-1 outline-none"
            >
              {cmd.label}
            </ContextMenu.Item>
          {/if}
        {/each}
        <ContextMenu.Separator
          class="m-1 h-0.5 bg-gray-200  dark:bg-gray-700 last:hidden"
        />
      {/each}
    </ContextMenu.Content>
  </ContextMenu.Portal>
</ContextMenu.Root>
