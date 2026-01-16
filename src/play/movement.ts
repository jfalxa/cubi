import { Ray, Vector3, type Scene } from '@babylonjs/core'

import { ShapeMesh } from '$/stage/mesh'
import type { KeyboardInput } from './input'
import type { PlayCamera } from './camera'

const SPEED = 16
const GRAVITY = 30
const TERMINAL_VELOCITY = 40
const GROUND_SNAP = 0.1
const JUMP_VELOCITY = 12

export class Movement {
	private input: KeyboardInput
	private camera: PlayCamera
	private scene: Scene
	private shapeId: string

	private velocityY = 0
	private grounded = false
	flying = true

	constructor(input: KeyboardInput, camera: PlayCamera, scene: Scene, shapeId: string) {
		this.input = input
		this.camera = camera
		this.scene = scene
		this.shapeId = shapeId
	}

	toggleFlying() {
		this.flying = !this.flying
		if (this.flying) this.velocityY = 0
	}

	setCollisionState(grounded: boolean, hitCeiling: boolean) {
		if (grounded && this.velocityY <= 0) {
			this.velocityY = 0
			this.grounded = true
		}
		if (hitCeiling && this.velocityY > 0) {
			this.velocityY = 0
		}
	}

	update(position: Vector3, deltaTime: number): Vector3 {
		const direction = new Vector3(0, 0, 0)

		if (this.input.forward) direction.z += 1
		if (this.input.backward) direction.z -= 1
		if (this.input.left) direction.x -= 1
		if (this.input.right) direction.x += 1

		if (this.flying) {
			if (this.input.up) direction.y += 1
			if (this.input.down) direction.y -= 1
		}

		const cameraForward = this.camera.getForwardRay().direction
		const forward = new Vector3(cameraForward.x, 0, cameraForward.z).normalize()
		const right = Vector3.Cross(Vector3.Up(), forward).normalize()

		const worldDirection = forward.scale(direction.z)
			.add(right.scale(direction.x))
			.add(Vector3.Up().scale(direction.y))

		if (worldDirection.lengthSquared() > 0) {
			worldDirection.normalize()
		}

		let newPosition = position.add(worldDirection.scale(SPEED * deltaTime))

		if (!this.flying) {
			const ground = this.detectGround(newPosition)

			if (ground !== null && newPosition.y <= ground + GROUND_SNAP && this.velocityY <= 0) {
				newPosition.y = ground
				this.velocityY = 0
				this.grounded = true

				if (this.input.up) {
					this.velocityY = JUMP_VELOCITY
					this.grounded = false
				}
			} else {
				this.grounded = false
				this.velocityY -= GRAVITY * deltaTime
				this.velocityY = Math.max(this.velocityY, -TERMINAL_VELOCITY)
				newPosition.y += this.velocityY * deltaTime
			}
		}

		return newPosition
	}

	private detectGround(position: Vector3): number | null {
		const ray = new Ray(position.add(new Vector3(0, 0.1, 0)), Vector3.Down(), 1000)

		const hit = this.scene.pickWithRay(ray, (mesh, thinInstanceIndex) => {
			return ShapeMesh.only(mesh, thinInstanceIndex) && mesh.id !== this.shapeId
		})

		if (hit?.hit && hit.pickedPoint) {
			return hit.pickedPoint.y
		}

		return null
	}
}
