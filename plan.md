# play mode for cubi

- there are now two modes: edit and play, and they share the same scene
- press e to enter any shape and move around
- by default there's gravity and third person wow-like camera 
- play mode has its own keybinds to avoid conflicts
- esc goes back to edit
- you control the shape directly - camera follows, input moves it
- no new entity types, no "player" object - just a shape being controlled

```
src/
  play/
    index.ts           # orchestrator, enter/exit
    camera.ts          # third-person follow camera
    movement.ts        # moves the shape
    input.ts           # keyboard state tracker
  stores/
    mode.svelte.ts     # mode: 'edit' | 'play', shapeId
```

