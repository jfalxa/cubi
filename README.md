# Cubi

Draw axis aligned boxes that snap to a grid in 3D.

## 3D Editor

### Navigation

- To move around the scene, drag the mouse with the middle button, or press `Control/Command` and drag with the left button
- To rotate the camera, drag the mouse with the right button, or press `Control/Command-Shift` and drag with the left button
- To zoom in or out, use the mouse wheel or scroll with your trackpad

### Drawing

Adding a box to the scene is done in 3 steps:

1. Click an empty space on the grid to select the first corner
2. Move the mouse and click again to select the opposite corner
3. Move the mouse and click to confirm height

At any step, you can press the right mouse button to go back to the previous step.
Right click while on the first step cancels the whole drawing operation.

### Selection

- Click a shape to select it
- Hold `Shift` and click a shape to add/remove it from the current list of selected shapes
- Double click a shape to select it and all other shapes that are in contact with it
- Hold `Shift` and double click on a shape to add it and its contacts to the list of selected shapes

### Moving

- Left click a selected shape and move the mouse around while holding the left mouse button to move a shape on the horizontal axes
- Hold `Shift` and drag a selected shape to move it exclusively on the vertical axis

### Resizing

- While pressing the `Alt` key, drag around one of the current selection bounding box faces to resize the shapes in that direction

### Layering

- While pressing the `Control/Command` key, double click on some point of a shape to move the drawing grid to that vertical layer

## Commands

All commands are accessible by right clicking the scene to open the context menu.
It will adapt based on where the mouse is pointing at, and the current selection.

#### Undo/Redo

- Shortcut: `Command/Control-Z` and `Command/Control-Shift-Z`
- Undo/redo actions that modified the shapes

#### Delete

- Shortcut: `Delete` or `Backspace`
- Remove the currently selected shapes from the scene

#### Duplicate

- Shortcut: `D`
- Duplicate the current selection

#### Group

- Shortcut: `G`
- Group all the selected shapes together, so that clicking any of them later will select all the others.
- Note that there is only one level of grouping, if you select two different groups and group them, all the shapes will form a single new group.

#### Ungroup

- Shortcut: `Shift-G`
- Ungroup the currently selected shapes

#### Colors

- No shortcut, only available in context menu.
- This is a menu that allows you to pick a color for the current selection

#### Rotate +/- 90˚

- Shortcut: `R` and `Shift-R`
- Rotate the selection by +/- 90˚

#### New

- Shortcut: `Control/Command-N` (might conflict with core browser shortcuts)
- Empty the current scene and undo/redo history

#### Open

- Shortcut: `Control/Command-O`
- Shows a file picker where you can select a cubi JSON file that will be loaded in the current scene

#### Save

- Shortcut: `Control/Command-S`
- Shows a download dialog that allows you to store the current scene's content in a JSON file on your device
