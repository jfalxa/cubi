<script lang="ts">
  import { onDestroy, onMount } from "svelte";

  import { Commands } from "$/commands";
  import { Stage } from "$/stage";
  import { createStores, useSync } from "$/stores";
  import { Tools } from "$/tools";
  import ContextMenu from "$/ui/context-menu.svelte";
  import FloatingMeasure from "$/ui/floating-measure.svelte";
  import UsageDialog from "$/ui/usage.svelte";
  import NewDialog from "$/ui/new-dialog.svelte";
  import GridForm from "./ui/grid-form.svelte";

  let container: HTMLDivElement;

  const stores = createStores();

  const stage = new Stage();

  const commands = new Commands({
    shapes: stores.shapes,
    selection: stores.selection,
    grid: stores.grid,
    contextMenu: stores.contextMenu,
    mode: stores.mode,
  });

  const tools = new Tools({
    stage,
    commands,
    shapes: stores.shapes,
    selection: stores.selection,
    contextMenu: stores.contextMenu,
    grid: stores.grid,
    measure: stores.measure,
  });

  onMount(() => {
    stage.mount(container);
    commands.open.mount(container);
  });

  onDestroy(() => {
    tools.dispose();
    stage.dispose();
  });

  useSync(stores, stage, tools);

  let usageOpen = $state(false);
</script>

<div bind:this={container}></div>

<button class="fixed right-4 top-4" onclick={() => (usageOpen = true)}>
  Usage
</button>

{#if stores.mode.mode === 'play'}
  <div class="fixed left-4 top-4 bg-black/80 text-white px-3 py-1 rounded text-sm">
    PLAY MODE (no controls yet) — refresh to exit
  </div>
{/if}

<UsageDialog bind:open={usageOpen} />

<ContextMenu
  commands={stores.contextMenu.commands}
  position={stores.contextMenu.position}
/>

<GridForm grid={stores.grid} />

<NewDialog
  shapes={stores.shapes}
  selection={stores.selection}
  contextMenu={stores.contextMenu}
/>

{#if stores.measure.box && stores.measure.position}
  <FloatingMeasure
    box={stores.measure.box}
    position={stores.measure.position}
  />
{/if}
