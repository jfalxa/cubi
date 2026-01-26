<script lang="ts">
  import { DropdownMenu } from "bits-ui";

  import type { AvailableCommand } from "$/commands";
  import { groupBy } from "$/utils/collection";

  import ColorMenu from "./color-menu.svelte";

  type Props = {
    commands: AvailableCommand[];
    hideDisabled?: boolean;
  };

  let { commands, hideDisabled = false }: Props = $props();

  let available = $derived(
    commands.filter((cmd) => !hideDisabled || !cmd.isDisabled()),
  );

  let grouped = $derived(groupBy(available, (cmd) => cmd.group));
</script>

{#each Object.keys(grouped) as group}
  <DropdownMenu.Group>
    {#each grouped[group] as cmd}
      {#if cmd.label == "Colors"}
        <ColorMenu command={cmd} />
      {:else}
        <DropdownMenu.Item
          onclick={() => cmd.action()}
          disabled={cmd.isDisabled()}
          class="highlight cursor-pointer rounded-sm px-3 py-1 outline-none "
        >
          {cmd.label}
        </DropdownMenu.Item>
      {/if}
    {/each}
  </DropdownMenu.Group>
  <DropdownMenu.Separator
    class="m-1 h-0.5 bg-gray-200  dark:bg-gray-700 last:hidden"
  />
{/each}
