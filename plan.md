# play mode for cubi

possess any shape and explore worlds you build.

## architecture

play mode is a **parallel stage** sharing the babylon scene but with its own camera and controls. editor stays clean—play mode is additive.

- no special entity type. any shape can be possessed
- keybind (P or Enter) while shape selected → enter play mode at that shape's position
- escape → exit back to editor
- ESDF movement (quake-style), WoW-style third-person camera

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

## camera style

WoW-like third-person camera:
- follows behind player at configurable distance (default ~5 units)
- right-drag to orbit around player (or pointer lock for free look)
- scroll wheel zooms in/out (min 2, max 20 units)
- camera target = player position + eye offset
- smooth follow with slight lag for polish

## play mode

- you control the shape directly - camera follows, input moves it
- no new entity types, no "player" object - just a shape being controlled
- collision radius derived from shape bounding box (future)

## challenges

**camera transition**: editor ArcRotateCamera → play ArcRotateCamera (different target). don't dispose editor camera, just swap `scene.activeCamera`.

**input handoff**: editor uses intent-based tool dispatch. play mode needs direct keyboard polling. disable editor interactions entirely during play.

**framerate independence**: delta-time all movement. velocity-based, not position-based.

**edge cases**:
- possessed shape deleted during play → exit to editor
- scene load/new during play → exit to editor
- selection state: clear on enter, don't restore on exit

---

## tasks

### phase 1: mode infrastructure

1. ~~**create mode store**~~ ✓
   - `src/stores/mode.svelte.ts`
   - state: `mode: 'edit' | 'play'`, `shapeId: string | null`
   - `playAsShape(shapeId)` and `edit()` methods

2. ~~**wire up mode store**~~ ✓
   - export from `src/stores/index.ts`
   - add to store creation in App.svelte

3. ~~**add play command**~~ ✓
   - new command in `src/commands/play.ts`
   - keybind: P when shape selected
   - calls `modeStore.playAsShape(selectedShapeId)`
   - guard: only available when exactly one shape selected

---

### 🔍 checkpoint: mode switching works

- P with shape selected → mode changes to 'play'
- escape → mode changes to 'edit'
- UI reflects mode (editor hidden during play)

---

### phase 2: fly mode (MVP)

4. **keyboard state tracker**
   - `src/play/input.ts`
   - track pressed keys via keydown/keyup
   - poll state each frame rather than event-driven
   - keys: E/S/D/F for movement, Space, Ctrl

5. **create PlayMode orchestrator**
   - `src/play/index.ts`
   - `enter(scene, shapeId)`: hide grid, disable editor, create camera targeting shape
   - `exit()`: show grid, restore editor, switch camera
   - owns render loop observer, cleans up on exit

6. **third-person camera**
   - `src/play/camera.ts`
   - ArcRotateCamera targeting player position
   - initial distance ~5 units, behind player
   - scroll wheel zoom (2-20 range)
   - right-drag orbits (or pointer lock toggle)

7. **movement controller**
   - `src/play/movement.ts`
   - moves the shape directly (updates shape.position in store)
   - ESDF movement relative to camera facing (XZ plane)
   - space = ascend, ctrl = descend
   - speed: ~8 units/sec
   - owns its update loop lifecycle

8. **hook up enter/exit flow**
   - App.svelte: when mode changes to 'play', call PlayMode.enter()
   - when mode changes to 'edit', call PlayMode.exit()
   - handle edge cases (shape deleted, scene change)

---

### 🔍 checkpoint: flyable MVP

- enter play mode, fly around freely with ESDF + space/ctrl
- camera follows behind, can orbit with mouse
- escape returns to editor cleanly
- no physics yet, just free movement

**review**: does movement feel good? camera distance right? controls intuitive?

---

### phase 3: camera polish

9. **smooth camera follow**
   - camera lerps to target position (slight lag)
   - avoids jarring snaps on direction change

10. **camera collision (optional)**
    - raycast from player to camera
    - if blocked, pull camera closer
    - prevents camera clipping through walls

11. **play mode HUD**
    - "ESC to exit" hint on enter (fades after 2s)
    - optional: velocity/position debug overlay

---

### 🔍 checkpoint: polished flight

- camera feels smooth and responsive
- HUD provides minimal guidance
- ready to add gravity

---

### phase 4: ground and gravity

12. **ground detection**
    - raycast down from player position
    - find highest shape surface below player
    - store `groundHeight` and `isGrounded`

13. **gravity system**
    - when not grounded: apply downward velocity
    - terminal velocity cap (~20 units/sec)
    - snap to ground when close and descending

14. **walk/fly toggle**
    - R key toggles between walk and fly mode
    - walk mode: gravity applies, can't ascend freely
    - fly mode: as before

15. **basic jump**
    - space while grounded → upward velocity impulse
    - gravity pulls back down

---

### 🔍 checkpoint: gravity works

- fall onto shapes, stand on surfaces
- jump and land
- R toggles fly (escape hatch if stuck)
- movement still feels responsive

---

### phase 5: collision (future)

16. **AABB collision detection**
    - before applying movement, check if new position overlaps any shape
    - player capsule: height 1.8, radius 0.4

17. **wall sliding**
    - when blocked, project movement onto collision surface
    - check each axis independently (X, then Z)

18. **step-up**
    - if blocked but obstacle height < 0.3 units, step up onto it

---

### phase 6: quake polish (future)

19. **acceleration curves**
    - ground acceleration: fast (~10 units/sec²)
    - air acceleration: slower (~2 units/sec²)
    - friction when no input

20. **air control**
    - can steer while airborne
    - strafe-jumping for speed (optional)

21. **bunny hop preservation**
    - jump while landing preserves momentum

---

### phase 7: extras (future)

22. **switch shapes during play**
    - click another shape → teleport to it

23. **charge jump**
    - hold space to charge, release for power jump

---

## key files

| file | purpose |
|------|---------|
| `src/stores/mode.svelte.ts` | new - mode state |
| `src/stores/index.ts` | export mode store |
| `src/commands/play.ts` | new - enter command |
| `src/commands/index.ts` | register play command |
| `src/play/index.ts` | new - orchestrator |
| `src/play/camera.ts` | new - follow camera |
| `src/play/movement.ts` | new - shape movement |
| `src/play/input.ts` | new - keyboard polling |
| `src/App.svelte` | mode switching |

---

## verification (MVP)

1. select shape, press P → camera moves to third-person behind shape
2. ESDF moves the shape around, space/ctrl ascends/descends
3. mouse orbits camera around shape
4. scroll zooms in/out
5. escape returns to editor, camera restored
6. shape position persists after exiting play mode
