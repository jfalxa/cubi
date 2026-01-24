import hotkeys from "hotkeys-js";
import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { GroundMesh } from "@babylonjs/core/Meshes/groundMesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import type { Observer } from "@babylonjs/core/Misc/observable";
import {
  CharacterSupportedState,
  PhysicsCharacterController,
} from "@babylonjs/core/Physics/v2/characterController";
import { PhysicsShapeType } from "@babylonjs/core/Physics/v2/IPhysicsEnginePlugin";
import { PhysicsAggregate } from "@babylonjs/core/Physics/v2/physicsAggregate";
import { HavokPlugin } from "@babylonjs/core/Physics/v2/Plugins/havokPlugin";

import "@babylonjs/core/Physics/v2/physicsEngineComponent";

import { Color3, StandardMaterial } from "@babylonjs/core";
import type { Scene } from "@babylonjs/core/scene";
import type { HavokPhysicsWithBindings } from "@babylonjs/havok";

import type { Grid } from "$/stage/grid";
import type { Interactions } from "$/stage/interactions";
import type { ShapeMesh } from "$/stage/mesh";
import type { View } from "$/stage/view";

const PLAYER_HEIGHT_M = 1.7;
const PLAYER_RADIUS_M = 0.1;
const WALK_SPEED_M = 4;
const JUMP_SPEED_M = 5;
const POINTER_SENSITIVITY = 0.0025;
const POINTER_SMOOTHING = 40;
const FIRST_PERSON_FOV = 0.8;
const GRAVITY_M = 9.81;
const MAX_SLOPE_DEG = 60;
const STEP_HEIGHT_M = 0.2;
const STEP_CLEARANCE_M = 0.03;
const CAMERA_POS_SMOOTHING = 25;

export class FirstPersonController {
  view: View;
  grid: Grid;
  interactions: Interactions;

  camera: UniversalCamera;
  active = false;

  private unit = 1;
  private radius = PLAYER_RADIUS_M;
  private height = PLAYER_HEIGHT_M;
  private speed = WALK_SPEED_M;
  private jumpSpeed = JUMP_SPEED_M;
  private eyeOffset = PLAYER_HEIGHT_M * 0.35;

  private yaw = 0;
  private pitch = 0;
  private targetYaw = 0;
  private targetPitch = 0;
  private cameraPos = Vector3.Zero();

  private controller: PhysicsCharacterController | null = null;
  private beforeRenderObserver: Observer<Scene> | null = null;
  private groundMesh: GroundMesh | null = null;
  private groundAggregate: PhysicsAggregate | null = null;

  private keys = {
    forward: false,
    back: false,
    left: false,
    right: false,
    jump: false,
  };

  private havokModule: HavokPhysicsWithBindings | null = null;
  private physicsReady = false;

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
  }

  configure(unit: number) {
    this.unit = unit;
    this.height = PLAYER_HEIGHT_M / unit;
    this.radius = PLAYER_RADIUS_M / unit;
    this.speed = WALK_SPEED_M / unit;
    this.jumpSpeed = JUMP_SPEED_M / unit;
    this.eyeOffset = this.height * 0.35;
    this.applyGravity();
  }

  toggle(from?: { position: Vector3; target?: Vector3 }) {
    if (this.active) return this.exit();
    return this.enter(from);
  }

  async enter(from?: { position: Vector3; target?: Vector3 }) {
    if (this.active) return;

    await this.ensurePhysics();
    if (!this.physicsReady) return;

    this.active = true;
    this.interactions.suspend();
    hotkeys.setScope("fp");

    this.hideGrid();
    this.prepareGround();

    const spawn = this.getSpawn(from);
    this.setupController(spawn);
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
    this.restoreGrid();
    this.teardownGround();

    this.controller?.dispose();
    this.controller = null;
  }

  dispose() {
    this.exit();

    this.groundAggregate?.dispose();
    this.groundAggregate = null;
    this.groundMesh?.dispose();
    this.groundMesh = null;
  }

  private async ensurePhysics() {
    if (this.physicsReady) return;

    const { default: loadHavok } = await import("@babylonjs/havok");
    this.havokModule = await loadHavok();

    const scene = this.view.scene;
    const plugin = new HavokPlugin(true, this.havokModule);
    scene.enablePhysics(new Vector3(0, -GRAVITY_M, 0), plugin);
    this.applyGravity();

    this.attachPhysicsToMeshes(scene, this.view.getMeshes());

    this.physicsReady = true;
  }

  private applyGravity() {
    const gravity = new Vector3(0, -GRAVITY_M / this.unit, 0);
    this.view.scene.gravity = gravity;
    this.view.scene.getPhysicsEngine()?.setGravity(gravity);
  }

  private attachPhysicsToMeshes(scene: Scene, meshes: ShapeMesh[]) {
    for (const mesh of meshes) {
      new PhysicsAggregate(
        mesh.instance,
        PhysicsShapeType.BOX,
        {
          mass: 0,
          friction: 0.8,
          restitution: 0,
        },
        scene,
      );
    }
  }

  private setupController(spawn: Vector3) {
    const scene = this.view.scene;

    this.controller?.dispose();

    this.controller = new PhysicsCharacterController(
      spawn,
      {
        capsuleHeight: this.height,
        capsuleRadius: this.radius,
      },
      scene,
    );

    this.controller.maxSlopeCosine = Math.cos((MAX_SLOPE_DEG * Math.PI) / 180);
    this.controller.up = new Vector3(0, 1, 0);
    this.controller.maxCharacterSpeedForSolver = 10 / this.unit;
    this.controller.penetrationRecoverySpeed = 2;
    this.controller.acceleration = 0.3;
    this.controller.maxAcceleration = this.speed * 15;

    this.camera.position.copyFrom(spawn);
    this.camera.position.y += this.eyeOffset;
    this.cameraPos.copyFrom(this.camera.position);
    this.camera.rotation.set(this.pitch, this.yaw, 0);
  }

  private getSpawn(from?: { position: Vector3; target?: Vector3 }) {
    const target = from?.target ?? Vector3.Zero();
    const source = from?.position ?? target.add(new Vector3(0, this.height, 0));
    let forward = target.subtract(source).normalize();
    if (!isFinite(forward.lengthSquared()) || forward.lengthSquared() === 0) {
      forward = new Vector3(0, 0, 1);
    }

    this.yaw = Math.atan2(forward.x, forward.z);
    this.pitch = Math.asin(forward.y);
    this.targetYaw = this.yaw;
    this.targetPitch = this.pitch;
    this.camera.rotation.set(this.pitch, this.yaw, 0);

    return new Vector3(target.x, target.y + this.height, target.z);
  }

  private hideGrid() {
    this.grid.mesh.setEnabled(false);
  }

  private restoreGrid() {
    this.grid.mesh.setEnabled(true);
  }

  private prepareGround() {
    const scene = this.view.scene;

    if (!this.groundMesh) {
      this.groundMesh = MeshBuilder.CreateGround(
        "fp-ground",
        { width: 1, height: 1 },
        scene,
      );
      const material = new StandardMaterial("ground_material", scene);
      material.specularColor = Color3.Black();
      material.diffuseColor = Color3.FromHexString("#dcdcdc");

      this.groundMesh.material = material;
    }

    this.groundMesh.scaling.set(this.grid.width, 1, this.grid.depth);
    this.groundMesh.position.set(0, 0, 0);
    this.groundMesh.isVisible = true;
    this.groundMesh.setEnabled(true);

    this.groundAggregate?.dispose();
    this.groundAggregate = new PhysicsAggregate(
      this.groundMesh,
      PhysicsShapeType.MESH,
      {
        mass: 0,
        friction: 0.9,
        restitution: 0,
      },
      scene,
    );
  }

  private teardownGround() {
    this.groundAggregate?.dispose();
    this.groundAggregate = null;

    if (this.groundMesh) {
      this.groundMesh.isVisible = false;
      this.groundMesh.setEnabled(false);
    }
  }

  private handlePointerMove = (event: PointerEvent) => {
    if (!this.active) return;
    if (document.pointerLockElement !== this.view.canvas) return;

    this.targetYaw += event.movementX * POINTER_SENSITIVITY;
    this.targetPitch += event.movementY * POINTER_SENSITIVITY;
    const minPitch = -Math.PI / 2 + 0.05;
    const maxPitch = Math.PI / 2 - 0.05;
    this.targetPitch = Math.min(Math.max(this.targetPitch, minPitch), maxPitch);
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
        this.keys.jump = true;
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
        this.keys.jump = false;
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
    if (!this.active || !this.controller) return;

    const delta = this.view.engine.getDeltaTime() / 1000;
    if (!delta) return;

    const smoothing = 1 - Math.exp(-POINTER_SMOOTHING * delta);
    this.yaw += (this.targetYaw - this.yaw) * smoothing;
    this.pitch += (this.targetPitch - this.pitch) * smoothing;
    this.camera.rotation.set(this.pitch, this.yaw, 0);

    // desired velocity in local space
    const forward = this.camera.getDirection(Vector3.Forward());
    forward.y = 0;
    forward.normalize();

    const right = this.camera.getDirection(Vector3.Right());
    right.y = 0;
    right.normalize();

    const desired = Vector3.Zero();

    if (this.keys.forward) desired.addInPlace(forward);
    if (this.keys.back) desired.subtractInPlace(forward);
    if (this.keys.left) desired.subtractInPlace(right);
    if (this.keys.right) desired.addInPlace(right);

    if (desired.lengthSquared() > 0) {
      desired.normalize().scaleInPlace(this.speed);
    }

    const physicsGravity =
      this.view.scene.getPhysicsEngine()?.gravity ?? this.view.scene.gravity;
    if (physicsGravity.lengthSquared() === 0) {
      physicsGravity.set(0, -GRAVITY_M / this.unit, 0);
    }
    const gravityDir =
      physicsGravity.lengthSquared() > 0
        ? physicsGravity.normalizeToNew()
        : new Vector3(0, -1, 0);

    const surface = this.controller.checkSupport(delta, gravityDir);
    const surfaceNormal =
      surface.averageSurfaceNormal.lengthSquared() > 1e-6
        ? surface.averageSurfaceNormal
        : this.controller.up;

    if (
      surface.supportedState === CharacterSupportedState.SUPPORTED &&
      desired.lengthSquared() > 1e-6 &&
      !this.keys.jump
    ) {
      this.tryStepUp(desired.normalizeToNew());
    }

    const currentVelocity = this.controller.getVelocity();
    const movementVelocity = this.controller.calculateMovement(
      delta,
      forward,
      surfaceNormal,
      currentVelocity,
      surface.averageSurfaceVelocity,
      desired,
      new Vector3(0, 1, 0),
    );
    const velocity = currentVelocity.clone();
    velocity.x = movementVelocity.x;
    velocity.z = movementVelocity.z;

    if (surface.supportedState !== CharacterSupportedState.SUPPORTED) {
      const gravityStep = new Vector3();
      physicsGravity.scaleToRef(delta, gravityStep);
      velocity.addInPlace(gravityStep);
    } else {
      velocity.y = 0;
    }

    if (
      this.keys.jump &&
      surface.supportedState === CharacterSupportedState.SUPPORTED
    ) {
      velocity.y = this.jumpSpeed;
    }

    this.controller.setVelocity(velocity);
    this.controller.integrate(delta, surface, physicsGravity);

    const pos = this.controller.getPosition();
    const targetPos = new Vector3(pos.x, pos.y + this.eyeOffset, pos.z);
    const posSmoothing = 1 - Math.exp(-CAMERA_POS_SMOOTHING * delta);
    this.cameraPos.x += (targetPos.x - this.cameraPos.x) * posSmoothing;
    this.cameraPos.y += (targetPos.y - this.cameraPos.y) * posSmoothing;
    this.cameraPos.z += (targetPos.z - this.cameraPos.z) * posSmoothing;
    this.camera.position.copyFrom(this.cameraPos);
  };

  private tryStepUp(desiredDir: Vector3) {
    if (!this.controller) return;

    const physicsEngine = this.view.scene.getPhysicsEngine();
    if (!physicsEngine) return;

    const pos = this.controller.getPosition();
    const stepHeight = STEP_HEIGHT_M / this.unit;
    const clearance = STEP_CLEARANCE_M / this.unit;
    const stepForward = Math.max(this.radius + clearance, stepHeight * 0.5);
    const footY = pos.y - this.height * 0.5 + this.radius;

    const lowFrom = new Vector3(pos.x, footY, pos.z);
    const lowTo = lowFrom.add(desiredDir.scale(stepForward));
    const lowHit = physicsEngine.raycast(lowFrom, lowTo);
    if (!lowHit.hasHit) return;

    const highFrom = new Vector3(pos.x, footY + stepHeight + clearance, pos.z);
    const highTo = highFrom.add(desiredDir.scale(stepForward));
    const highHit = physicsEngine.raycast(highFrom, highTo);
    if (highHit.hasHit) return;

    const downFrom = new Vector3(
      lowTo.x,
      pos.y + stepHeight + this.height * 0.5,
      lowTo.z,
    );
    const downTo = new Vector3(lowTo.x, pos.y - this.height, lowTo.z);
    const downHit = physicsEngine.raycast(downFrom, downTo);

    const next = pos.clone();
    if (downHit.hasHit) {
      next.y = Math.max(next.y, downHit.hitPointWorld.y + this.height * 0.5);
    } else {
      next.y += stepHeight;
    }

    this.controller.setPosition(next);
  }
}
