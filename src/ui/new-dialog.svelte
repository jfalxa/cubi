<script lang="ts">
  import type { ContextMenuStore } from "$/stores/context-menu.svelte";
  import type { ShapeStore } from "$/stores/shape.svelte";

  import Dialog from "$/ui/dialog.svelte";

  type Props = {
    shapes: ShapeStore;
    contextMenu: ContextMenuStore;
  };

  let { shapes, contextMenu }: Props = $props();

  function confirm() {
    shapes.reset();
    contextMenu.showNewDialog = false;
  }

  function cancel() {
    contextMenu.showNewDialog = false;
  }
</script>

<Dialog
  bind:open={contextMenu.showNewDialog}
  title="New stage"
  contentClass="w-[min(90vw,420px)] p-6"
  titleClass="text-2xl font-semibold"
>
  <p class="mt-4 text-sm text-gray-600 dark:text-gray-300">
    Your stage is not empty, clear it anyway?
  </p>

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
