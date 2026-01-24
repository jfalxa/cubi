import hotkeys from "hotkeys-js";
import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { GroundMesh } from "@babylonjs/core/Meshes/groundMesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import type { Observer } from "@babylonjs/core/Misc/observable";
import type { Scene } from "@babylonjs/core/scene";

import type { Grid } from "$/stage/grid";
import type { Interactions } from "$/stage/interactions";
import type { View } from "$/stage/view";
import { getColors } from "$/utils/colors";

const PLAYER_HEIGHT_M = 1.6;
const STEP_HEIGHT_M = 0.2;
const PLAYER_RADIUS_M = 0.15;
const WALK_SPEED_M = 3;
const JUMP_SPEED_M = 4;
const POINTER_SENSITIVITY = 0.0025;
const GROUND_OFFSET = -0.002;
const GROUND_LERP = 10; // vertical smoothing factor (per second)
const STEP_TOLERANCE = 0.05; // extra meters beyond nominal step height
const CLEARANCE_EPS = 0.01; // tolerance to avoid sticking
const MIN_PITCH = -Math.PI / 2 + 0.05;
const MAX_PITCH = Math.PI / 2 - 0.05;
const FIRST_PERSON_FOV = 0.8;
const GRAVITY_M = 9.81;

export class FirstPersonController {
  view: View;
  grid: Grid;
  interactions: Interactions;

  camera: UniversalCamera;
  ground: GroundMesh;

  active = false;

  private unit = 1;
  private eyeHeight = PLAYER_HEIGHT_M;
  private stepHeight = STEP_HEIGHT_M;
  private radius = PLAYER_RADIUS_M;
  private speed = WALK_SPEED_M;
  private groundHeight = 0;
  private verticalVelocity = 0;
  private grounded = true;

  private yaw = 0;
  private pitch = 0;

  private keys = {
    forward: false,
    back: false,
    left: false,
    right: false,
  };

  private beforeRenderObserver: Observer<Scene> | null = null;
  private gridEnabledBefore = true;

  constructor(view: View, grid: Grid, interactions: Interactions) {
    this.view = view;
    this.grid = grid;
    this.interactions = interactions;

    this.camera = new UniversalCamera(
      "first-person-camera",
      Vector3.Zero(),
      this.view.scene,
    );

    this.camera.minZ = 0.05;
    this.camera.fov = FIRST_PERSON_FOV;
    this.camera.inertia = 0;
    this.camera.speed = 0;
    this.camera.inputs.clear();
    this.camera.setEnabled(false);

    this.ground = MeshBuilder.CreateGround(
      "first-person-ground",
      { width: 1, height: 1 },
      this.view.scene,
    );

    const material = new StandardMaterial(
      "first-person-ground-mat",
      this.view.scene,
    );
    const colors = getColors();
    material.diffuseColor = Color3.FromHexString(colors.minor);
    material.specularColor = Color3.Black();
    material.alpha = 0.55;

    this.ground.material = material;
    this.ground.isVisible = false;
    this.ground.checkCollisions = true;
    this.ground.isPickable = false;
    this.ground.position.y = GROUND_OFFSET;
  }

  configure(unit: number, width: number, depth: number) {
    this.unit = unit;
    this.eyeHeight = PLAYER_HEIGHT_M / unit;
    this.stepHeight = STEP_HEIGHT_M / unit;
    this.radius = PLAYER_RADIUS_M / unit;
    this.speed = WALK_SPEED_M / unit;
    this.view.scene.gravity = new Vector3(0, -GRAVITY_M / this.unit, 0);

    const halfHeight = this.eyeHeight / 2;
    this.camera.ellipsoid = new Vector3(this.radius, halfHeight, this.radius);
    this.camera.ellipsoidOffset = new Vector3(0, halfHeight, 0);

    const safeWidth = Math.max(width, 0.001);
    const safeDepth = Math.max(depth, 0.001);
    this.ground.scaling.set(safeWidth, 1, safeDepth);
  }

  toggle(from?: { position: Vector3; target?: Vector3 }) {
    if (this.active) return this.exit();
    return this.enter(from);
  }

  enter(from?: { position: Vector3; target?: Vector3 }) {
    if (this.active) return;

    this.active = true;
    this.interactions.suspend();
    hotkeys.setScope("fp");

    this.view.scene.collisionsEnabled = true;
    this.view.scene.gravity = new Vector3(0, -GRAVITY_M / this.unit, 0);
    this.camera.checkCollisions = true;
    this.camera.applyGravity = false;

    const spawn = this.getSpawn(from);
    this.camera.position.copyFrom(spawn);

    this.ground.isVisible = true;
    this.ground.setEnabled(true);
    this.gridEnabledBefore = this.grid.mesh.isEnabled();
    this.grid.mesh.setEnabled(false);
    this.camera.setEnabled(true);
    this.view.scene.activeCamera = this.camera;

    this.view.canvas.addEventListener("pointermove", this.handlePointerMove);
    this.view.canvas.addEventListener("click", this.requestPointerLock);
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
    window.addEventListener("keydown", this.handleEscape, { capture: true });

    this.beforeRenderObserver = this.view.scene.onBeforeRenderObservable.add(
      this.update,
    );

    this.requestPointerLock();
  }

  exit() {
    if (!this.active) return;

    this.active = false;
    this.interactions.resume();
    hotkeys.setScope("default");

    this.view.scene.onBeforeRenderObservable.remove(this.beforeRenderObserver);
    this.beforeRenderObserver = null;

    this.view.canvas.removeEventListener("pointermove", this.handlePointerMove);
    this.view.canvas.removeEventListener("click", this.requestPointerLock);
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
    window.removeEventListener("keydown", this.handleEscape, { capture: true });

    if (document.pointerLockElement === this.view.canvas) {
      document.exitPointerLock();
    }

    this.camera.setEnabled(false);
    this.ground.isVisible = false;
    this.ground.setEnabled(false);
    this.grid.mesh.setEnabled(this.gridEnabledBefore);

    this.keys = {
      forward: false,
      back: false,
      left: false,
      right: false,
    };

    this.verticalVelocity = 0;
    this.grounded = true;
  }

  private getSpawn(from?: { position: Vector3; target?: Vector3 }) {
    const target = from?.target ?? Vector3.Zero();
    const source =
      from?.position ?? target.add(new Vector3(0, this.eyeHeight, 0));
    let forward = target.subtract(source).normalize();
    if (!isFinite(forward.lengthSquared()) || forward.lengthSquared() === 0) {
      forward = new Vector3(0, 0, 1);
    }

    this.yaw = Math.atan2(forward.x, forward.z);
    this.pitch = Math.asin(forward.y);
    this.pitch = Math.min(Math.max(this.pitch, MIN_PITCH), MAX_PITCH);
    this.camera.rotation.set(this.pitch, this.yaw, 0);

    const ground = this.getGroundHeight(target, 0);
    const surface = ground ?? this.getSurfaceHeight(target);
    this.groundHeight = Math.max(surface, 0);
    this.verticalVelocity = 0;
    this.grounded = true;

    return new Vector3(target.x, this.groundHeight + this.eyeHeight, target.z);
  }

  private handlePointerMove = (event: PointerEvent) => {
    if (!this.active) return;
    if (document.pointerLockElement !== this.view.canvas) return;

    this.yaw += event.movementX * POINTER_SENSITIVITY;
    this.pitch += event.movementY * POINTER_SENSITIVITY;
    this.pitch = Math.min(Math.max(this.pitch, MIN_PITCH), MAX_PITCH);

    this.camera.rotation.set(this.pitch, this.yaw, 0);
  };

  private handleKeyDown = (event: KeyboardEvent) => {
    let handled = true;
    switch (event.code) {
      case "KeyW":
      case "ArrowUp":
        this.keys.forward = true;
        break;
      case "KeyS":
      case "ArrowDown":
        this.keys.back = true;
        break;
      case "KeyA":
      case "ArrowLeft":
        this.keys.left = true;
        break;
      case "KeyD":
      case "ArrowRight":
        this.keys.right = true;
        break;
      case "Space":
        if (this.grounded) {
          this.verticalVelocity = JUMP_SPEED_M / this.unit;
          this.grounded = false;
        }
        break;
      default:
        handled = false;
    }

    if (handled) event.preventDefault();
  };

  private handleKeyUp = (event: KeyboardEvent) => {
    let handled = true;
    switch (event.code) {
      case "KeyW":
      case "ArrowUp":
        this.keys.forward = false;
        break;
      case "KeyS":
      case "ArrowDown":
        this.keys.back = false;
        break;
      case "KeyA":
      case "ArrowLeft":
        this.keys.left = false;
        break;
      case "KeyD":
      case "ArrowRight":
        this.keys.right = false;
        break;
      case "Space":
        // no-op on release
        handled = false;
        break;
      default:
        handled = false;
    }

    if (handled) event.preventDefault();
  };

  private handleEscape = (event: KeyboardEvent) => {
    if (event.code !== "Escape") return;
    if (!this.active) return;
    event.preventDefault();
    this.exit();
    this.view.scene.activeCamera =
      this.view.scene.getCameraByName("camera") ?? this.camera;
  };

  private requestPointerLock = () => {
    if (document.pointerLockElement === this.view.canvas) return;
    this.view.canvas.requestPointerLock();
  };

  private update = () => {
    if (!this.active) return;

    const delta = this.view.engine.getDeltaTime() / 1000;
    if (!delta) return;

    const direction = this.getMoveDirection();
    const hasHorizontal = direction.lengthSquared() > 0;

    const horizontalStep = hasHorizontal
      ? direction.normalize().scale(this.speed * delta)
      : Vector3.Zero();

    const target = this.camera.position.add(horizontalStep);
    const support = this.getGroundHeight(target, this.groundHeight);
    if (support === null) return;

    // apply horizontal move immediately
    this.camera.position.x = target.x;
    this.camera.position.z = target.z;

    // gravity integration
    this.verticalVelocity -= (GRAVITY_M / this.unit) * delta;

    // step-up snap when grounded and within step height
    const rising = support > this.groundHeight + CLEARANCE_EPS;
    const smallStep =
      support - this.groundHeight <= this.stepHeight + STEP_TOLERANCE;

    if (this.grounded && rising && smallStep) {
      this.groundHeight = support;
      this.verticalVelocity = 0;
      this.grounded = true;
    } else {
      this.groundHeight = this.lerp(
        this.groundHeight,
        support,
        1 - Math.exp(-GROUND_LERP * delta),
      );
      this.grounded = false;
    }

    // vertical position update
    let nextY = this.camera.position.y + this.verticalVelocity * delta;
    const floorY = support + this.eyeHeight;

    if (nextY <= floorY) {
      nextY = floorY;
      this.verticalVelocity = 0;
      this.grounded = true;
      this.groundHeight = support;
    }

    this.camera.position.y = nextY;
  };

  private getMoveDirection() {
    const forward = this.camera.getDirection(Vector3.Forward());
    forward.y = 0;
    forward.normalize();

    const right = this.camera.getDirection(Vector3.Right());
    right.y = 0;
    right.normalize();

    const dir = Vector3.Zero();
    if (this.keys.forward) dir.addInPlace(forward);
    if (this.keys.back) dir.subtractInPlace(forward);
    if (this.keys.left) dir.subtractInPlace(right);
    if (this.keys.right) dir.addInPlace(right);
    return dir;
  }

  private getGroundHeight(
    position: Vector3,
    currentGround: number,
  ): number | null {
    const head = currentGround + this.eyeHeight;
    const climbLimit = currentGround + this.stepHeight + STEP_TOLERANCE;

    let ground = 0;

    const meshes = this.view.getMeshes();
    for (const mesh of meshes) {
      const { shape } = mesh;

      const minX = shape.position.x - this.radius;
      const maxX = shape.position.x + shape.width + this.radius;
      const minZ = shape.position.z - this.radius;
      const maxZ = shape.position.z + shape.depth + this.radius;

      if (
        position.x < minX ||
        position.x > maxX ||
        position.z < minZ ||
        position.z > maxZ
      ) {
        continue;
      }

      const bottom = shape.position.y;
      const top = bottom + shape.height;

      if (top <= climbLimit + CLEARANCE_EPS) {
        ground = Math.max(ground, top);
        continue;
      }

      if (
        bottom < head - CLEARANCE_EPS &&
        top > currentGround - CLEARANCE_EPS
      ) {
        return null;
      }
    }

    return ground;
  }

  private lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
  }

  private getSurfaceHeight(position: Vector3) {
    let surface = 0;

    for (const mesh of this.view.getMeshes()) {
      const { shape } = mesh;

      const minX = shape.position.x - this.radius;
      const maxX = shape.position.x + shape.width + this.radius;
      const minZ = shape.position.z - this.radius;
      const maxZ = shape.position.z + shape.depth + this.radius;

      if (
        position.x < minX ||
        position.x > maxX ||
        position.z < minZ ||
        position.z > maxZ
      ) {
        continue;
      }

      surface = Math.max(surface, shape.position.y + shape.height);
    }

    return surface;
  }

  dispose() {
    this.exit();
    this.ground.dispose();
    this.camera.dispose();
  }
}
