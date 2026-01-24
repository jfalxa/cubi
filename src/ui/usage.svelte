<script lang="ts">
  import Dialog from "$/ui/dialog.svelte";

  type Props = {
    open?: boolean;
  };

  let { open = $bindable(false) }: Props = $props();
</script>

<Dialog
  bind:open
  title="Usage"
  showClose
  contentClass="prose dark:prose-invert w-[min(90vw,900px)] overflow-hidden"
  headerClass="p-6"
  titleClass="text-4xl font-semibold"
  bodyClass="p-6 max-h-[70vh] space-y-6 overflow-y-auto whitespace-normal text-sm leading-relaxed"
>
  <h2 id="3d-editor" class="mt-0">3D Editor</h2>
  <h3 id="navigation">Navigation</h3>
  <ul>
    <li>
      To move around the scene, drag the mouse with the middle button, or press <code
        >Control/Command</code
      > and drag with the left button
    </li>
    <li>
      To rotate the camera, drag the mouse with the right button, or press <code
        >Control/Command-Shift</code
      > and drag with the left button
    </li>
    <li>To zoom in or out, use the mouse wheel or scroll with your trackpad</li>
  </ul>
  <h3 id="layering-active-vertical-focus-">Layering (active vertical focus)</h3>
  <ul>
    <li>
      While pressing the <code>Control/Command</code> key, double click on some point
      of a shape to move the drawing grid to that vertical layer
    </li>
    <li>
      Doing this on an empty space (with no shape under the mouse) resets the
      grid layer to 0.
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
    At any step, you can press the right mouse button to go back to the previous
    step. Right click while on the first step cancels the whole drawing
    operation.
  </p>
  <h3 id="carving">Carving</h3>
  <p>
    When holding <code>Alt</code> when starting to draw a new box, the operation will
    become a &quot;carving&quot; operation. This means that when the drawn box will
    be committed, it will actually remove its volume from every box it was passing
    through, splitting them into smaller boxes that leave a hole inbetween.
  </p>
  <h3 id="selection">Selection</h3>
  <ul>
    <li>Click a shape to select it</li>
    <li>
      Hold <code>Shift</code> and click a shape to add/remove it from the current
      list of selected shapes
    </li>
    <li>
      Double click a shape to select it and all other shapes that are in contact
      with it
    </li>
    <li>
      Hold <code>Shift</code> and double click on a shape to add it and its contacts
      to the list of selected shapes
    </li>
    <li>
      If a shape is below the current layer, you can&#39;t select it by clicking
      it, except while holding <code>Shift</code>
    </li>
  </ul>
  <h3 id="moving">Moving</h3>
  <ul>
    <li>
      Left click a selected shape and move the mouse around while holding the
      left mouse button to move a shape on the horizontal axes
    </li>
    <li>
      Hold <code>Shift</code> and drag a selected shape to move it exclusively on
      the vertical axis
    </li>
  </ul>
  <h3 id="resizing">Resizing</h3>
  <ul>
    <li>
      While pressing the <code>Alt</code> key, drag around one of the current selection
      bounding box faces to resize the shapes in that direction
    </li>
  </ul>
  <h2 id="commands">Commands</h2>
  <p>
    All commands are accessible by right clicking the scene to open the context
    menu. It will adapt based on where the mouse is pointing at, and the current
    selection.
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
      Group all the selected shapes together, so that clicking any of them later
      will select all the others.
    </li>
    <li>
      Note that there is only one level of grouping, if you select two different
      groups and group them, all the shapes will form a single new group.
    </li>
  </ul>
  <h3 id="ungroup">Ungroup</h3>
  <ul>
    <li>Shortcut: <code>Shift-G</code></li>
    <li>Ungroup the currently selected shapes</li>
  </ul>
  <h3 id="lock">Lock</h3>
  <ul>
    <li>Shortcut: <code>L</code></li>
    <li>
      Locks the selected shapes so they cannot be selected and modified
      inadvertently
    </li>
  </ul>
  <h3 id="unlock">Unlock</h3>
  <ul>
    <li>Shortcut: <code>Shift-L</code></li>
    <li>Unlock the selected shapes so they can be modified again</li>
  </ul>
  <h3 id="colors">Colors</h3>
  <ul>
    <li>No shortcut, only available in context menu.</li>
    <li>
      This is a menu that allows you to pick a color for the current selection
    </li>
  </ul>
  <h3 id="rotate-90-">Rotate +/- 90˚</h3>
  <ul>
    <li>Shortcut: <code>R</code> and <code>Shift-R</code></li>
    <li>Rotate the selection by +/- 90˚</li>
  </ul>
  <h3 id="toggle-level">Toggle level</h3>
  <ul>
    <li>Shortcut: <code>Space</code></li>
    <li>
      Toggle level view mode. When active, all the shapes above the currently
      active layer + the value defined in the <code>Level height</code> field of the
      grid settings will be hidden.
    </li>
    <li>
      This allows you to define different vertical levels in your scene, and
      focus on only one at a time.
    </li>
  </ul>
  <h3 id="grid-size">Grid size</h3>
  <ul>
    <li>No shortcut</li>
    <li>
      This is a menu that allows setting the width and depth of the drawing grid
      in meters.
    </li>
    <li>
      You can also set a &quot;Unit&quot;, that represents the size of a single
      grid square in centimeters. Note that this won&#39;t resize your shapes,
      it&#39;s only used to compute the dimensions displayed in the floating
      measure label.
    </li>
    <li>
      The last field is &quot;Level height&quot;, it defines the height beyond
      which shapes will stop showing when in level view mode. See &quot;Toggle
      level&quot;.
    </li>
  </ul>
  <h3 id="layer-up-down">Layer up/down</h3>
  <ul>
    <li>Shortcut: <code>ArrowUp</code> / <code>ArrowDown</code></li>
    <li>
      Moves the currently active vertical grid layer up/down one step at a time
    </li>
  </ul>
  <h3 id="level-up-down">Level up/down</h3>
  <ul>
    <li>Shortcut: <code>Shift-ArrowUp</code> / <code>Shift-ArrowDown</code></li>
    <li>Moves the currently active level up/down</li>
    <li>
      Uses &quot;Level height&quot; from grid config to make the current active
      layer jump to the next available level
    </li>
  </ul>
  <h3 id="import">Import</h3>
  <ul>
    <li>Shortcut: <code>Control/Command-I</code></li>
    <li>
      Imports a JSON file in the current scene, without clearing its current
      state
    </li>
  </ul>
  <h3 id="export">Export</h3>
  <ul>
    <li>Shortcut: <code>Control/Command-E</code></li>
    <li>Exports the currently selected shapes in a JSON file</li>
    <li>
      Combined with &quot;Import&quot;, it allows you to create a library of
      reusable components
    </li>
  </ul>
  <h3 id="new">New</h3>
  <ul>
    <li>
      Shortcut: <code>Control/Command-N</code> (might conflict with core browser shortcuts)
    </li>
    <li>Empty the current scene and undo/redo history</li>
  </ul>
  <h3 id="open">Open</h3>
  <ul>
    <li>Shortcut: <code>Control/Command-O</code></li>
    <li>
      Shows a file picker where you can select a cubi JSON file that will be
      loaded as the current scene
    </li>
  </ul>
  <h3 id="save">Save</h3>
  <ul>
    <li>Shortcut: <code>Control/Command-S</code></li>
    <li>
      Shows a download dialog that allows you to store the current scene&#39;s
      content in a JSON file on your device
    </li>
  </ul>
</Dialog>
