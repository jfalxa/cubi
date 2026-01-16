<script lang="ts">
  import { Dialog } from "bits-ui";

  type Props = {
    open?: boolean;
  };

  let { open = $bindable(false) }: Props = $props();
</script>

<Dialog.Root bind:open>
  <Dialog.Portal>
    <Dialog.Overlay class="fixed inset-0 bg-black/40" />
    <Dialog.Content
      class="fixed left-1/2 top-1/2 w-[min(90vw,900px)] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl"
    >
      <div class="flex items-start justify-between gap-4">
        <Dialog.Title class="text-2xl font-semibold text-gray-900">
          Usage
        </Dialog.Title>
        <Dialog.Close
          class="rounded-md border border-gray-200 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          Close
        </Dialog.Close>
      </div>
      <div
        class="mt-4 max-h-[70vh] space-y-6 overflow-y-auto whitespace-normal text-sm leading-relaxed text-gray-800"
      >
        <h3 id="navigation" class="text-lg font-semibold text-gray-900">
          Navigation
        </h3>
        <ul class="list-disc space-y-1 pl-5 text-sm text-gray-700">
          <li>
            To move around the scene, drag the mouse with the middle button, or
            press Control/Command and drag with the left button
          </li>
          <li>
            To rotate the camera, drag the mouse with the right button, or press
            Control/Command + Shift and drag with the left button
          </li>
          <li>
            To zoom in or out, use the mouse wheel or scroll with your trackpad
          </li>
        </ul>
        <h3 id="drawing" class="text-lg font-semibold text-gray-900">
          Drawing
        </h3>
        <ol class="list-decimal space-y-1 pl-5 text-sm text-gray-700">
          <li>Click an empty space to select the first corner</li>
          <li>Move the mouse and click again to select the opposite corner</li>
          <li>Move the mouse and click to confirm height</li>
        </ol>
        <h3 id="selection" class="text-lg font-semibold text-gray-900">
          Selection
        </h3>
        <ul class="list-disc space-y-1 pl-5 text-sm text-gray-700">
          <li>Click a shape to select it</li>
          <li>
            <code
              class="rounded bg-gray-100 px-1 py-0.5 font-mono text-[0.85em] text-gray-800"
              >Shift</code
            >-click a shape to add/remove it from the current list of selected
            shapes
          </li>
          <li>
            Double click a shape to select it and all other shapes that are in
            contact with it
          </li>
          <li>
            <code
              class="rounded bg-gray-100 px-1 py-0.5 font-mono text-[0.85em] text-gray-800"
              >Shift</code
            >-double click to add a shape and its contacts to the list of
            selected shapes
          </li>
        </ul>
        <h3 id="moving" class="text-lg font-semibold text-gray-900">Moving</h3>
        <ul class="list-disc space-y-1 pl-5 text-sm text-gray-700">
          <li>
            Left click a selected shape and move the mouse around while holding
            the left mouse button to move a shape on the horizontal axes
          </li>
          <li>
            <code
              class="rounded bg-gray-100 px-1 py-0.5 font-mono text-[0.85em] text-gray-800"
              >Shift</code
            >-drag a selected shape to move it exclusively on the vertical axis
          </li>
        </ul>
        <h3 id="resizing" class="text-lg font-semibold text-gray-900">
          Resizing
        </h3>
        <ul class="list-disc space-y-1 pl-5 text-sm text-gray-700">
          <li>
            While pressing the
            <code
              class="rounded bg-gray-100 px-1 py-0.5 font-mono text-[0.85em] text-gray-800"
              >Alt</code
            >
            key, drag around one of the current selection bounding box faces to resize
            the shapes in that direction
          </li>
        </ul>
        <h3 id="layering" class="text-lg font-semibold text-gray-900">
          Layering
        </h3>
        <ul class="list-disc space-y-1 pl-5 text-sm text-gray-700">
          <li>
            While pressing the
            <code
              class="rounded bg-gray-100 px-1 py-0.5 font-mono text-[0.85em] text-gray-800"
              >Control/Command</code
            >
            key, double click on some point of a shape to move the drawing grid to
            that vertical layer
          </li>
        </ul>
        <h3 id="commands" class="text-lg font-semibold text-gray-900">
          Commands
        </h3>
        <p class="text-sm text-gray-700">
          All commands are accessible by right clicking the scene to open the
          context menu. It will adapt based on where the mouse is pointing at,
          and the current selection.
        </p>
        <h4 id="undo-redo" class="text-base font-semibold text-gray-900">
          Undo/Redo
        </h4>
        <ul class="list-disc space-y-1 pl-5 text-sm text-gray-700">
          <li>
            Shortcut:
            <code
              class="rounded bg-gray-100 px-1 py-0.5 font-mono text-[0.85em] text-gray-800"
              >Command/Control-Z</code
            >
            and
            <code
              class="rounded bg-gray-100 px-1 py-0.5 font-mono text-[0.85em] text-gray-800"
              >Command/Control-Shift-Z</code
            >
          </li>
          <li>Undo/redo actions that modified the shapes</li>
        </ul>
        <h4 id="delete" class="text-base font-semibold text-gray-900">
          Delete
        </h4>
        <ul class="list-disc space-y-1 pl-5 text-sm text-gray-700">
          <li>
            Shortcut:
            <code
              class="rounded bg-gray-100 px-1 py-0.5 font-mono text-[0.85em] text-gray-800"
              >Delete</code
            >
            or
            <code
              class="rounded bg-gray-100 px-1 py-0.5 font-mono text-[0.85em] text-gray-800"
              >Backspace</code
            >
          </li>
          <li>Remove the currently selected shapes from the scene</li>
        </ul>
        <h4 id="duplicate" class="text-base font-semibold text-gray-900">
          Duplicate
        </h4>
        <ul class="list-disc space-y-1 pl-5 text-sm text-gray-700">
          <li>
            Shortcut:
            <code
              class="rounded bg-gray-100 px-1 py-0.5 font-mono text-[0.85em] text-gray-800"
              >D</code
            >
          </li>
          <li>Duplicate the current selection</li>
        </ul>
        <h4 id="group" class="text-base font-semibold text-gray-900">Group</h4>
        <ul class="list-disc space-y-1 pl-5 text-sm text-gray-700">
          <li>
            Shortcut:
            <code
              class="rounded bg-gray-100 px-1 py-0.5 font-mono text-[0.85em] text-gray-800"
              >G</code
            >
          </li>
          <li>
            Group all the selected shapes together, so that clicking any of them
            later will select all the others.
          </li>
          <li>
            Note that there is only one level of grouping, if you select two
            different groups and group them, all the shapes will form a single
            new group.
          </li>
        </ul>
        <h4 id="ungroup" class="text-base font-semibold text-gray-900">
          Ungroup
        </h4>
        <ul class="list-disc space-y-1 pl-5 text-sm text-gray-700">
          <li>
            Shortcut:
            <code
              class="rounded bg-gray-100 px-1 py-0.5 font-mono text-[0.85em] text-gray-800"
              >Shift-G</code
            >
          </li>
          <li>Ungroup the currently selected shapes</li>
        </ul>
        <h4 id="colors" class="text-base font-semibold text-gray-900">
          Colors
        </h4>
        <ul class="list-disc space-y-1 pl-5 text-sm text-gray-700">
          <li>No shortcut, only available in context menu.</li>
          <li>
            This is a menu that allows you to pick a color for the current
            selection
          </li>
        </ul>
        <h4 id="rotate-90-" class="text-base font-semibold text-gray-900">
          Rotate +/- 90˚
        </h4>
        <ul class="list-disc space-y-1 pl-5 text-sm text-gray-700">
          <li>
            Shortcut:
            <code
              class="rounded bg-gray-100 px-1 py-0.5 font-mono text-[0.85em] text-gray-800"
              >R</code
            >
            and
            <code
              class="rounded bg-gray-100 px-1 py-0.5 font-mono text-[0.85em] text-gray-800"
              >Shift-R</code
            >
          </li>
          <li>Rotate the selection by +/- 90˚</li>
        </ul>
        <h4 id="new" class="text-base font-semibold text-gray-900">New</h4>
        <ul class="list-disc space-y-1 pl-5 text-sm text-gray-700">
          <li>
            Shortcut:
            <code
              class="rounded bg-gray-100 px-1 py-0.5 font-mono text-[0.85em] text-gray-800"
              >Control/Command-N</code
            >
            (might conflict with core browser shortcuts)
          </li>
          <li>Empty the current scene and undo/redo history</li>
        </ul>
        <h4 id="open" class="text-base font-semibold text-gray-900">Open</h4>
        <ul class="list-disc space-y-1 pl-5 text-sm text-gray-700">
          <li>
            Shortcut:
            <code
              class="rounded bg-gray-100 px-1 py-0.5 font-mono text-[0.85em] text-gray-800"
              >Control/Command-O</code
            >
          </li>
          <li>
            Shows a file picker where you can select a cubi JSON file that will
            be loaded in the current scene
          </li>
        </ul>
        <h4 id="save" class="text-base font-semibold text-gray-900">Save</h4>
        <ul class="list-disc space-y-1 pl-5 text-sm text-gray-700">
          <li>
            Shortcut:
            <code
              class="rounded bg-gray-100 px-1 py-0.5 font-mono text-[0.85em] text-gray-800"
              >Control/Command-S</code
            >
          </li>
          <li>
            Shows a download dialog that allows you to store the current
            scene&#39;s content in a JSON file on your device
          </li>
        </ul>
      </div>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
