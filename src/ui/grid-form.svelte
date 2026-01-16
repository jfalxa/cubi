<script lang="ts">
  import { Dialog } from "bits-ui";

  import type { GridStore } from "$/stores/grid.svelte";

  type Props = {
    grid: GridStore;
  };

  let { grid }: Props = $props();

  let width = $state("");
  let depth = $state("");

  $effect(() => {
    if (grid.showGridForm) {
      width = String(grid.width / 10);
      depth = String(grid.depth / 10);
    }
  });

  function confirm() {
    grid.update({
      width: parseFloat(width) * 10,
      depth: parseFloat(depth) * 10,
    });

    grid.showGridForm = false;
  }

  function cancel() {
    grid.showGridForm = false;
  }
</script>

<Dialog.Root bind:open={grid.showGridForm}>
  <Dialog.Portal>
    <Dialog.Overlay class="fixed inset-0 bg-black/40" />
    <Dialog.Content
      class="surface fixed left-1/2 top-1/2 w-[min(90vw,420px)] -translate-x-1/2 -translate-y-1/2 rounded-xl p-6"
    >
      <div class="flex items-center justify-between gap-4">
        <Dialog.Title class="text-2xl font-semibold">Grid size</Dialog.Title>
      </div>

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
      </div>

      <div class="mt-6 flex justify-end gap-3">
        <button
          class="surface rounded-md px-4 py-2"
          type="button"
          onclick={cancel}
        >
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
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
