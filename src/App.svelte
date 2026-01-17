<script lang="ts">
  import { onDestroy, onMount } from "svelte";

  import { Commands } from "$/commands";
  import { PlayMode } from "$/play";
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

  const playMode = new PlayMode(
    stage,
    stores.shapes,
    stores.mode,
    stores.camera,
  );
  stores.mode.onEnterPlay = (shapeId) => playMode.enter(shapeId);
  stores.mode.onExitPlay = () => playMode.exit();

  onMount(() => {
    stage.mount(container);
    commands.open.mount(container);
  });

  onDestroy(() => {
    playMode.exit();
    tools.dispose();
    stage.dispose();
  });

  useSync(stores, stage, tools);

  let usageOpen = $state(false);
</script>

<div bind:this={container}></div>

<div class="fixed right-4 top-4 flex gap-2">
  <div class="file-menu">
    <button onclick={() => commands.new.execute()}>New</button>
    <button onclick={() => commands.open.execute()}>Open</button>
    <button onclick={() => commands.save.execute([])}>Save</button>
    <button onclick={() => commands.import.execute()}>Import</button>
    <button
      onclick={() =>
        commands.export.execute(stores.selection.getSelectedShapes())}
      >Export</button
    >
    <button class="trigger">☰</button>
  </div>
  <button onclick={() => (usageOpen = true)}>?</button>
</div>

{#if stores.mode.mode === "play"}
  <div
    class="play-hud fixed left-4 top-4 bg-black/80 text-white px-3 py-1 rounded text-sm"
  >
    WASD · Space jump · ESC exit
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

{#if stores.mode.mode === "edit" && stores.measure.box && stores.measure.position}
  <FloatingMeasure
    box={stores.measure.box}
    position={stores.measure.position}
  />
{/if}

<style>
  .file-menu {
    display: flex;
    gap: 0.5rem;
  }
  .file-menu button:not(.trigger) {
    display: none;
  }
  .file-menu:hover button:not(.trigger),
  .file-menu:focus-within button:not(.trigger) {
    display: block;
  }
  .play-hud {
    animation: fade-out 0.5s ease-out 2s forwards;
  }
  @keyframes fade-out {
    to {
      opacity: 0;
      pointer-events: none;
    }
  }
</style>
