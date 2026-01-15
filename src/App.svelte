<script lang="ts">
  import { onDestroy, onMount } from "svelte";

  import { Commands } from "$/commands";
  import { Stage } from "$/stage";
  import { createStores, useSync } from "$/stores";
  import { Tools } from "$/tools";
  import ContextMenu from "$/ui/context-menu.svelte";
  import FloatingMeasure from "$/ui/floating-measure.svelte";

  let container: HTMLDivElement;

  const stores = createStores();

  const stage = new Stage();

  const commands = new Commands({
    shapes: stores.shapes,
    selection: stores.selection,
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
</script>

<div bind:this={container}></div>

<ContextMenu
  commands={stores.contextMenu.commands}
  position={stores.contextMenu.position}
/>

{#if stores.measure.box && stores.measure.position}
  <FloatingMeasure
    box={stores.measure.box}
    position={stores.measure.position}
  />
{/if}
