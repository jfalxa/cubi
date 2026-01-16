import { Vector3 } from '@babylonjs/core'

import type { KeyboardInput } from './input'
import type { PlayCamera } from './camera'

const SPEED = 16

export class Movement {
	private input: KeyboardInput
	private camera: PlayCamera

	constructor(input: KeyboardInput, camera: PlayCamera) {
		this.input = input
		this.camera = camera
	}

	update(position: Vector3, deltaTime: number): Vector3 {
		const direction = new Vector3(0, 0, 0)

		if (this.input.forward) direction.z += 1
		if (this.input.backward) direction.z -= 1
		if (this.input.left) direction.x -= 1
		if (this.input.right) direction.x += 1
		if (this.input.up) direction.y += 1
		if (this.input.down) direction.y -= 1

		if (direction.lengthSquared() === 0) return position

		direction.normalize()

		const cameraForward = this.camera.getForwardRay().direction
		const forward = new Vector3(cameraForward.x, 0, cameraForward.z).normalize()
		const right = Vector3.Cross(Vector3.Up(), forward).normalize()

		const worldDirection = forward.scale(direction.z)
			.add(right.scale(direction.x))
			.add(Vector3.Up().scale(direction.y))

		const velocity = worldDirection.scale(SPEED * deltaTime)

		return position.add(velocity)
	}
}
