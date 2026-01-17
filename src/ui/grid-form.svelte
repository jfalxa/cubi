<script lang="ts">
  import Dialog from "$/ui/dialog.svelte";

  import type { GridStore } from "$/stores/grid.svelte";

  type Props = {
    grid: GridStore;
  };

  let { grid }: Props = $props();

  let width = $state("");
  let depth = $state("");
  let unit = $state("");

  $effect(() => {
    if (grid.showGridForm) {
      width = String((grid.width * grid.unit) / 100);
      depth = String((grid.depth * grid.unit) / 100);
      unit = String(grid.unit);
    }
  });

  function confirm() {
    const newUnit = parseFloat(unit);

    grid.update({
      width: (parseFloat(width) * 100) / newUnit,
      depth: (parseFloat(depth) * 100) / newUnit,
      unit: newUnit,
    });

    grid.showGridForm = false;
  }

  function cancel() {
    grid.showGridForm = false;
  }
</script>

<Dialog
  bind:open={grid.showGridForm}
  title="Grid size"
  contentClass="w-[min(90vw,420px)] p-6"
  titleClass="text-2xl font-semibold"
>
  <div class="mt-6 space-y-4">
    <label class="grid gap-2 text-sm">
      <span class="text-gray-500 dark:text-gray-400">Width (m)</span>
      <input
        class="surface rounded-md px-3 py-2"
        type="number"
        min="0.1"
        step="0.1"
        bind:value={width}
      />
    </label>

    <label class="grid gap-2 text-sm">
      <span class="text-gray-500 dark:text-gray-400">Depth (m)</span>
      <input
        class="surface rounded-md px-3 py-2"
        type="number"
        min="0.1"
        step="0.1"
        bind:value={depth}
      />
    </label>

    <label class="grid gap-2 text-sm">
      <span class="text-gray-500 dark:text-gray-400">Unit (cm)</span>
      <input
        class="surface rounded-md px-3 py-2"
        type="number"
        min="0.1"
        step="0.1"
        bind:value={unit}
      />
    </label>
  </div>

  <div class="mt-6 flex justify-end gap-3">
    <button class="surface rounded-md px-4 py-2" type="button" onclick={cancel}>
      Cancel
    </button>
    <button
      class="surface rounded-md px-4 py-2"
      type="button"
      onclick={confirm}
    >
      Confirm
    </button>
  </div>
</Dialog>
