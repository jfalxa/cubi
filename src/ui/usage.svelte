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
      class="fixed left-1/2 top-1/2 w-[min(90vw,900px)] -translate-x-1/2 -translate-y-1/2 rounded-xl prose bg-white shadow-xl overflow-hidden"
    >
      <div class="flex items-start justify-between gap-4 p-6">
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
        class="mt-4 p-6 max-h-[70vh] space-y-6 overflow-y-auto whitespace-normal text-sm leading-relaxed text-gray-800"
      >
        <h2 id="3d-editor" class="mt-0">3D Editor</h2>
        <h3 id="navigation">Navigation</h3>
        <ul>
          <li>
            To move around the scene, drag the mouse with the middle button, or
            press <code>Control/Command</code> and drag with the left button
          </li>
          <li>
            To rotate the camera, drag the mouse with the right button, or press <code
              >Control/Command-Shift</code
            > and drag with the left button
          </li>
          <li>
            To zoom in or out, use the mouse wheel or scroll with your trackpad
          </li>
        </ul>
        <h3 id="drawing">Drawing</h3>
        <p>Adding a box to the scene is done in 3 steps:</p>
        <ol>
          <li>Click an empty space on the grid to select the first corner</li>
          <li>Move the mouse and click again to select the opposite corner</li>
          <li>Move the mouse and click to confirm height</li>
        </ol>
        <p>
          At any step, you can press the right mouse button to go back to the
          previous step. Right click while on the first step cancels the whole
          drawing operation.
        </p>
        <h3 id="selection">Selection</h3>
        <ul>
          <li>Click a shape to select it</li>
          <li>
            Hold <code>Shift</code> and click a shape to add/remove it from the current
            list of selected shapes
          </li>
          <li>
            Double click a shape to select it and all other shapes that are in
            contact with it
          </li>
          <li>
            Hold <code>Shift</code> and double click on a shape to add it and its
            contacts to the list of selected shapes
          </li>
        </ul>
        <h3 id="moving">Moving</h3>
        <ul>
          <li>
            Left click a selected shape and move the mouse around while holding
            the left mouse button to move a shape on the horizontal axes
          </li>
          <li>
            Hold <code>Shift</code> and drag a selected shape to move it exclusively
            on the vertical axis
          </li>
        </ul>
        <h3 id="resizing">Resizing</h3>
        <ul>
          <li>
            While pressing the <code>Alt</code> key, drag around one of the current
            selection bounding box faces to resize the shapes in that direction
          </li>
        </ul>
        <h3 id="layering">Layering</h3>
        <ul>
          <li>
            While pressing the <code>Control/Command</code> key, double click on
            some point of a shape to move the drawing grid to that vertical layer
          </li>
          <li>
            Doing this on an empty space (with no shape under the mouse) resets
            the grid layer to 0.
          </li>
        </ul>
        <h2 id="commands">Commands</h2>
        <p>
          All commands are accessible by right clicking the scene to open the
          context menu. It will adapt based on where the mouse is pointing at,
          and the current selection.
        </p>
        <h3 id="undo-redo">Undo/Redo</h3>
        <ul>
          <li>
            Shortcut: <code>Command/Control-Z</code> and
            <code>Command/Control-Shift-Z</code>
          </li>
          <li>Undo/redo actions that modified the shapes</li>
        </ul>
        <h3 id="delete">Delete</h3>
        <ul>
          <li>Shortcut: <code>Delete</code> or <code>Backspace</code></li>
          <li>Remove the currently selected shapes from the scene</li>
        </ul>
        <h3 id="duplicate">Duplicate</h3>
        <ul>
          <li>Shortcut: <code>D</code></li>
          <li>Duplicate the current selection</li>
        </ul>
        <h3 id="group">Group</h3>
        <ul>
          <li>Shortcut: <code>G</code></li>
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
        <h3 id="ungroup">Ungroup</h3>
        <ul>
          <li>Shortcut: <code>Shift-G</code></li>
          <li>Ungroup the currently selected shapes</li>
        </ul>
        <h3 id="colors">Colors</h3>
        <ul>
          <li>No shortcut, only available in context menu.</li>
          <li>
            This is a menu that allows you to pick a color for the current
            selection
          </li>
        </ul>
        <h3 id="rotate-90-">Rotate +/- 90˚</h3>
        <ul>
          <li>Shortcut: <code>R</code> and <code>Shift-R</code></li>
          <li>Rotate the selection by +/- 90˚</li>
        </ul>
        <h3 id="new">New</h3>
        <ul>
          <li>
            Shortcut: <code>Control/Command-N</code> (might conflict with core browser
            shortcuts)
          </li>
          <li>Empty the current scene and undo/redo history</li>
        </ul>
        <h3 id="open">Open</h3>
        <ul>
          <li>Shortcut: <code>Control/Command-O</code></li>
          <li>
            Shows a file picker where you can select a cubi JSON file that will
            be loaded in the current scene
          </li>
        </ul>
        <h3 id="save">Save</h3>
        <ul>
          <li>Shortcut: <code>Control/Command-S</code></li>
          <li>
            Shows a download dialog that allows you to store the current
            scene&#39;s content in a JSON file on your device
          </li>
        </ul>
      </div>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
