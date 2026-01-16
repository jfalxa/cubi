<script lang="ts">
  import type { AvailableCommand } from "$/commands";
  import { ContextMenu } from "bits-ui";

  const { command: cmd }: { command: AvailableCommand } = $props();
</script>

<ContextMenu.Sub>
  <ContextMenu.SubTrigger
    class="highlight flex flex-row justify-between cursor-pointer rounded-sm px-3 py-1 outline-none"
  >
    {cmd.label}
    <span>⏵</span>
  </ContextMenu.SubTrigger>
  <ContextMenu.Portal>
    <ContextMenu.SubContent
      class="surface w-48 overflow-hidden rounded-sm p-1 outline-none"
      sideOffset={8}
    >
      {#each Object.entries(cmd.options!) as [label, option]}
        <ContextMenu.Item
          class="highlight flex flex-row justify-between items-center cursor-pointer rounded-sm px-3 py-1 outline-none"
          onclick={() => cmd.action(option)}
        >
          {label}
          <span
            class="w-4 h-4 rounded-sm shadow dark:shadow-gray-600"
            style="background-color: {option};"
          ></span>
        </ContextMenu.Item>
      {/each}
    </ContextMenu.SubContent>
  </ContextMenu.Portal>
</ContextMenu.Sub>
