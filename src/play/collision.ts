import { Vector3 } from '@babylonjs/core'

import type { ShapeStore } from '$/stores/shape.svelte'
import type { Box, Shape } from '$/types'

const STEP_HEIGHT = 0.3

interface CollisionResult {
	position: Vector3
	grounded: boolean
	hitCeiling: boolean
}

export class Collision {
	private shapes: ShapeStore
	private controlledId: string

	constructor(shapes: ShapeStore, controlledId: string) {
		this.shapes = shapes
		this.controlledId = controlledId
	}

	resolve(current: Vector3, proposed: Vector3, bounds: Box): CollisionResult {
		const result: CollisionResult = {
			position: proposed.clone(),
			grounded: false,
			hitCeiling: false
		}

		const obstacles = this.shapes.current.filter(s => s.id !== this.controlledId)
		if (obstacles.length === 0) return result

		// try full movement first
		if (!this.collides(proposed, bounds, obstacles)) {
			return result
		}

		// axis-separated resolution: X → Z → Y
		const resolved = current.clone()

		// try X movement
		const tryX = new Vector3(proposed.x, current.y, current.z)
		if (!this.collides(tryX, bounds, obstacles)) {
			resolved.x = proposed.x
		} else if (this.canStepUp(tryX, bounds, obstacles)) {
			resolved.x = proposed.x
			resolved.y = current.y + STEP_HEIGHT
		}

		// try Z movement
		const tryZ = new Vector3(resolved.x, current.y, proposed.z)
		if (!this.collides(tryZ, bounds, obstacles)) {
			resolved.z = proposed.z
		} else if (this.canStepUp(tryZ, bounds, obstacles)) {
			resolved.z = proposed.z
			resolved.y = current.y + STEP_HEIGHT
		}

		// try Y movement - apply delta to preserve step-up
		const yDelta = proposed.y - current.y
		const tryY = new Vector3(resolved.x, resolved.y + yDelta, resolved.z)
		if (!this.collides(tryY, bounds, obstacles)) {
			resolved.y = resolved.y + yDelta
		} else {
			// blocked vertically
			if (proposed.y < current.y) {
				// moving down, hit floor
				result.grounded = true
				resolved.y = this.findFloorHeight(resolved, bounds, obstacles, current.y)
			} else if (proposed.y > current.y) {
				// moving up, hit ceiling
				result.hitCeiling = true
				resolved.y = this.findCeilingHeight(resolved, bounds, obstacles, current.y)
			}
		}

		result.position = resolved
		return result
	}

	private collides(position: Vector3, bounds: Box, obstacles: Shape[]): boolean {
		const playerMin = this.getMin(position, bounds)
		const playerMax = this.getMax(position, bounds)

		for (const shape of obstacles) {
			const shapeMin = this.getMin(shape.position, shape)
			const shapeMax = this.getMax(shape.position, shape)

			if (this.aabbIntersects(playerMin, playerMax, shapeMin, shapeMax)) {
				return true
			}
		}
		return false
	}

	private canStepUp(position: Vector3, bounds: Box, obstacles: Shape[]): boolean {
		// check if stepping up by STEP_HEIGHT clears the obstacle
		const steppedUp = position.add(new Vector3(0, STEP_HEIGHT, 0))
		if (this.collides(steppedUp, bounds, obstacles)) return false

		// verify we're colliding with an obstacle that's actually low enough
		const playerMin = this.getMin(position, bounds)
		const playerMax = this.getMax(position, bounds)
		const playerBottom = position.y - bounds.height / 2

		for (const shape of obstacles) {
			const shapeMin = this.getMin(shape.position, shape)
			const shapeMax = this.getMax(shape.position, shape)

			// must overlap horizontally
			if (playerMax.x <= shapeMin.x || playerMin.x >= shapeMax.x) continue
			if (playerMax.z <= shapeMin.z || playerMin.z >= shapeMax.z) continue

			const shapeTop = shape.position.y + shape.height / 2
			const obstacleHeight = shapeTop - playerBottom
			if (obstacleHeight > 0 && obstacleHeight <= STEP_HEIGHT) {
				return true
			}
		}
		return false
	}

	private findFloorHeight(position: Vector3, bounds: Box, obstacles: Shape[], fallback: number): number {
		let highest = -Infinity
		const playerHalfWidth = bounds.width / 2
		const playerHalfDepth = bounds.depth / 2

		for (const shape of obstacles) {
			const shapeTop = shape.position.y + shape.height / 2
			const shapeMin = this.getMin(shape.position, shape)
			const shapeMax = this.getMax(shape.position, shape)

			// check horizontal overlap
			if (position.x + playerHalfWidth > shapeMin.x &&
				position.x - playerHalfWidth < shapeMax.x &&
				position.z + playerHalfDepth > shapeMin.z &&
				position.z - playerHalfDepth < shapeMax.z) {
				if (shapeTop > highest && shapeTop <= fallback + bounds.height / 2) {
					highest = shapeTop
				}
			}
		}

		return highest === -Infinity ? fallback : highest + bounds.height / 2
	}

	private findCeilingHeight(position: Vector3, bounds: Box, obstacles: Shape[], fallback: number): number {
		let lowest = Infinity
		const playerHalfWidth = bounds.width / 2
		const playerHalfDepth = bounds.depth / 2

		for (const shape of obstacles) {
			const shapeBottom = shape.position.y - shape.height / 2
			const shapeMin = this.getMin(shape.position, shape)
			const shapeMax = this.getMax(shape.position, shape)

			// check horizontal overlap
			if (position.x + playerHalfWidth > shapeMin.x &&
				position.x - playerHalfWidth < shapeMax.x &&
				position.z + playerHalfDepth > shapeMin.z &&
				position.z - playerHalfDepth < shapeMax.z) {
				if (shapeBottom < lowest && shapeBottom >= fallback - bounds.height / 2) {
					lowest = shapeBottom
				}
			}
		}

		return lowest === Infinity ? fallback : lowest - bounds.height / 2
	}

	private getMin(position: Vector3, bounds: Box): Vector3 {
		return new Vector3(
			position.x - bounds.width / 2,
			position.y - bounds.height / 2,
			position.z - bounds.depth / 2
		)
	}

	private getMax(position: Vector3, bounds: Box): Vector3 {
		return new Vector3(
			position.x + bounds.width / 2,
			position.y + bounds.height / 2,
			position.z + bounds.depth / 2
		)
	}

	private aabbIntersects(minA: Vector3, maxA: Vector3, minB: Vector3, maxB: Vector3): boolean {
		return minA.x < maxB.x && maxA.x > minB.x &&
			minA.y < maxB.y && maxA.y > minB.y &&
			minA.z < maxB.z && maxA.z > minB.z
	}
}
