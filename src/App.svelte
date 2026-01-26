<script lang="ts">
  import { onDestroy, onMount } from "svelte";

  import { Commands } from "$/commands";
  import { Stage } from "$/stage";
  import { createStores, useSync } from "$/stores";
  import { Tools } from "$/tools";
  import ContextMenu from "$/ui/context-menu.svelte";
  import FloatingMeasure from "$/ui/floating-measure.svelte";
  import NewDialog from "$/ui/new-dialog.svelte";
  import UsageDialog from "$/ui/usage.svelte";

  import GeneralMenu from "./ui/general-menu.svelte";
  import GridForm from "./ui/grid-form.svelte";

  let container: HTMLDivElement;

  const stores = createStores();

  const stage = new Stage();

  const commands = new Commands({
    shapes: stores.shapes,
    selection: stores.selection,
    camera: stores.camera,
    grid: stores.grid,
    menu: stores.menu,
  });

  const tools = new Tools({
    stage,
    commands,
    shapes: stores.shapes,
    selection: stores.selection,
    menu: stores.menu,
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

  useSync(stores, stage, commands, tools);
</script>

<div bind:this={container}></div>

<GeneralMenu commands={stores.menu.general} />

<UsageDialog />

<ContextMenu commands={stores.menu.context} position={stores.menu.position} />

<GridForm grid={stores.grid} shapes={stores.shapes} camera={stores.camera} />

<NewDialog
  shapes={stores.shapes}
  selection={stores.selection}
  grid={stores.grid}
  camera={stores.camera}
  menu={stores.menu}
/>

{#if stores.measure.box && stores.measure.position}
  <FloatingMeasure
    box={stores.measure.box}
    unit={stores.grid.unit}
    position={stores.measure.position}
  />
{/if}
