import "@babylonjs/core/Physics/v2/physicsEngineComponent";

import hotkeys from "hotkeys-js";
import type { Camera } from "@babylonjs/core/Cameras/camera";
import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
import { Axis } from "@babylonjs/core/Maths/math.axis";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Observer } from "@babylonjs/core/Misc/observable";
import {
  CharacterSupportedState,
  PhysicsCharacterController,
  type CharacterSurfaceInfo,
} from "@babylonjs/core/Physics/v2/characterController";
import { PhysicsShapeType } from "@babylonjs/core/Physics/v2/IPhysicsEnginePlugin";
import { PhysicsAggregate } from "@babylonjs/core/Physics/v2/physicsAggregate";
import { HavokPlugin } from "@babylonjs/core/Physics/v2/Plugins/havokPlugin";
import type { Scene } from "@babylonjs/core/scene";

import type { Grid } from "./grid";
import type { Interactions } from "./interactions";
import type { ShapeMesh } from "./mesh";
import type { View } from "./view";

const GRAVITY_M = 9.81;
const PLAYER_HEIGHT_M = 1.7;
const PLAYER_RADIUS_M = 0.15;
const WALK_SPEED_M = 4;
const JUMP_SPEED_M = 5;
const MAX_SLOPE_DEG = 75;
const POINTER_SENSITIVITY = 0.0025;
const LOOK_SMOOTHING = 35;

interface FirstPersonInit {
  position: Vector3;
  target: Vector3;
  unit: number;
}

export class FirstPerson {
  view: View;
  grid: Grid;
  interactions: Interactions;

  camera: UniversalCamera;
  physics: Physics;
  inputs: Inputs;

  active = false;

  private renderObserver?: Observer<Scene>;

  constructor(view: View, grid: Grid, interactions: Interactions) {
    this.view = view;
    this.grid = grid;
    this.interactions = interactions;

    this.physics = new Physics(view);
    this.inputs = new Inputs(view);

    this.camera = new UniversalCamera(
      "first-person-camera",
      new Vector3(0, 0, 0),
      this.view.scene,
    );

    this.camera.inputs.clear();
  }

  dispose() {
    this.inputs.dispose();
    this.physics.dispose();
    this.camera.dispose();
  }

  async enter(init: FirstPersonInit) {
    if (this.active) return;
    this.active = true;

    this.interactions.suspend();
    hotkeys.setScope("first-person");

    this.view.setCamera(this.camera);

    this.inputs.mount();
    await this.physics.mount(init);

    this.renderObserver = this.view.scene.onBeforeRenderObservable.add(this.update); // prettier-ignore
  }

  exit() {
    if (!this.active) return;
    this.active = false;

    this.renderObserver?.remove();
    this.renderObserver = undefined;

    const orbitCamera = this.view.scene.getCameraByName("orbit-camera");
    this.view.setCamera(orbitCamera);

    this.interactions.resume();
    hotkeys.setScope("editor");

    this.physics.dispose();
    this.inputs.dispose();
  }

  private forward = Vector3.Zero();
  private right = Vector3.Zero();

  private updateDirections() {
    this.camera.getDirectionToRef(Axis.Z, this.forward);
    this.camera.getDirectionToRef(Axis.X, this.right);

    this.forward.y = 0;
    this.right.y = 0;
  }

  private update = () => {
    const delta = this.view.scene.deltaTime / 1000;

    this.inputs.update(delta);
    this.camera.rotation.set(this.inputs.pitch, this.inputs.yaw, 0);

    this.updateDirections();

    const isJumping = this.inputs.isJumping();
    const direction = this.inputs.getDirection(this.forward, this.right);

    this.physics.update(delta, direction, isJumping, this.forward);
    this.camera.position.copyFrom(this.physics.position);
  };
}

class Physics {
  private unit = 1;
  private height = 0;
  private radius = 0;
  private speed = 0;
  private jumpSpeed = 0;

  private gravity = Vector3.Zero();
  private gravityDirection = Vector3.Zero();

  private velocity = Vector3.Zero();
  private desired = Vector3.Zero();
  private zero = Vector3.Zero();
  private up = Vector3.Up();
  private surface: CharacterSurfaceInfo | undefined;

  private player: PhysicsCharacterController | undefined;
  private shapes: PhysicsAggregate[] = [];

  yaw = 0;

  get position() {
    return this.player!.getPosition();
  }

  constructor(private view: View) {}

  async mount({ unit }: FirstPersonInit) {
    const { default: HavokPhysics } = await import("@babylonjs/havok");

    this.unit = unit;

    this.height = PLAYER_HEIGHT_M / unit;
    this.radius = PLAYER_RADIUS_M / unit;
    this.speed = WALK_SPEED_M / unit;
    this.jumpSpeed = JUMP_SPEED_M / unit;
    this.gravity.y = -(GRAVITY_M / unit);

    const havok = await HavokPhysics();
    const havokPlugin = new HavokPlugin(true, havok);

    this.view.scene.enablePhysics(this.gravity, havokPlugin);

    this.player = this.createPlayerController(new Vector3(0, 30, 0));
    this.shapes = this.view.getMeshes().map((m) => this.createMeshBody(m));
  }

  dispose() {
    this.player?.dispose();
    for (const shape of this.shapes) shape.dispose();
    this.view.scene.disablePhysicsEngine();
  }

  isSupported() {
    return this.surface?.supportedState === CharacterSupportedState.SUPPORTED;
  }

  getSupport(delta: number) {
    this.gravity.normalizeToRef(this.gravityDirection);

    if (!this.surface) {
      this.surface = this.player!.checkSupport(delta, this.gravityDirection);
    } else {
      this.player!.checkSupportToRef(delta, this.gravityDirection, this.surface); // prettier-ignore
    }

    return this.surface;
  }

  getDesiredVelocity(direction: Vector3) {
    if (direction.lengthSquared() > 1e-6) {
      this.desired.x = direction.x * this.speed;
      this.desired.z = direction.z * this.speed;
    } else {
      this.desired.setAll(0);
    }

    return this.desired;
  }

  update(delta: number, direction: Vector3, jump: boolean, forward: Vector3) {
    if (!this.player) return;

    const surface = this.getSupport(delta);
    const isSupported = this.isSupported();

    const previousVelocityY = this.velocity.y;

    const surfaceNormal = isSupported ? surface.averageSurfaceNormal : this.up;
    const currentVelocity = this.player.getVelocity();
    const surfaceVelocity = isSupported ? surface.averageSurfaceVelocity : this.zero; // prettier-ignore
    const desiredVelocity = this.getDesiredVelocity(direction);

    if (isSupported) {
      this.player.calculateMovementToRef(
        delta,
        forward,
        surfaceNormal,
        currentVelocity,
        surfaceVelocity,
        desiredVelocity,
        this.up,
        this.velocity,
      );
    }

    if (isSupported && jump) {
      this.velocity.y = this.jumpSpeed;
    } else if (isSupported) {
      this.velocity.y = Math.max(this.velocity.y, 0);
    } else {
      this.velocity.y = previousVelocityY + this.gravity.y * delta;
    }

    this.player.setVelocity(this.velocity);
    this.player.integrate(delta, surface, this.gravity);
  }

  private createPlayerController(spawn = Vector3.Zero()) {
    const controller = new PhysicsCharacterController(
      spawn,
      {
        capsuleHeight: this.height,
        capsuleRadius: this.radius,
      },
      this.view.scene,
    );

    controller.maxSlopeCosine = Math.cos((MAX_SLOPE_DEG * Math.PI) / 180);
    controller.up = Vector3.Up();
    controller.keepDistance = 0.08 / this.unit;
    controller.keepContactTolerance = 0.16 / this.unit;
    controller.maxCharacterSpeedForSolver = 10 / this.unit;
    controller.penetrationRecoverySpeed = 2;
    controller.acceleration = 0.1;
    controller.maxAcceleration = this.speed * 4;

    return controller;
  }

  private createMeshBody(mesh: ShapeMesh) {
    return new PhysicsAggregate(
      mesh.instance,
      PhysicsShapeType.BOX,
      {
        mass: 0,
        friction: 0.8,
        restitution: 0,
      },
      mesh.scene,
    );
  }
}

type Button = "forward" | "backward" | "left" | "right" | "jump";

class Inputs {
  buttons: Record<Button, boolean> = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
  };

  yaw = 0;
  pitch = 0;

  private yawTarget = 0;
  private pitchTarget = 0;

  private direction = Vector3.Zero();

  constructor(private view: View) {}

  mount() {
    this.yawTarget = this.yaw;
    this.pitchTarget = this.pitch;

    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
    this.view.canvas.addEventListener("pointermove", this.handlePointerMove);

    this.requestPointerLock();
  }

  dispose() {
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
    this.view.canvas.removeEventListener("pointermove", this.handlePointerMove);

    this.exitPointerLock();
  }

  hasPointerLock() {
    return document.pointerLockElement === this.view.canvas;
  }

  requestPointerLock() {
    if (!this.hasPointerLock()) {
      this.view.canvas.requestPointerLock();
    }
  }

  exitPointerLock() {
    if (this.hasPointerLock()) {
      document.exitPointerLock();
    }
  }

  isJumping() {
    return this.buttons.jump;
  }

  getDirection(forward: Vector3, right: Vector3) {
    this.direction.setAll(0);

    if (this.buttons.forward || this.buttons.backward) {
      if (this.buttons.forward) this.direction.addInPlace(forward);
      if (this.buttons.backward) this.direction.subtractInPlace(forward);
    }

    if (this.buttons.left || this.buttons.right) {
      if (this.buttons.left) this.direction.subtractInPlace(right);
      if (this.buttons.right) this.direction.addInPlace(right);
    }

    return this.direction.normalize();
  }

  update(delta: number) {
    const t = Math.min(1, delta * LOOK_SMOOTHING);
    this.yaw += (this.yawTarget - this.yaw) * t;
    this.pitch += (this.pitchTarget - this.pitch) * t;
  }

  static codeToButton: Record<string, Button> = {
    KeyW: "forward",
    KeyS: "backward",
    KeyA: "left",
    KeyD: "right",
    ArrowUp: "forward",
    ArrowDown: "backward",
    ArrowLeft: "left",
    ArrowRight: "right",
    Space: "jump",
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    const button = Inputs.codeToButton[e.code];
    if (!button) return;
    e.preventDefault();
    this.buttons[button] = true;
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    const button = Inputs.codeToButton[e.code];
    if (!button) return;
    e.preventDefault();
    this.buttons[button] = false;
  };

  private handlePointerMove = (event: PointerEvent) => {
    if (!this.hasPointerLock()) return;

    this.yawTarget += event.movementX * POINTER_SENSITIVITY;
    this.pitchTarget += event.movementY * POINTER_SENSITIVITY;

    const minPitch = -Math.PI / 2 + 0.05;
    const maxPitch = Math.PI / 2 - 0.05;
    this.pitchTarget = Math.min(Math.max(this.pitchTarget, minPitch), maxPitch);
  };
}
