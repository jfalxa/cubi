import { ArcRotateCamera, Ray, Vector3, type Scene } from '@babylonjs/core'
import { ShapeMesh } from '$/stage/mesh'

export class PlayCamera extends ArcRotateCamera {
	private eyeOffset: Vector3
	private desiredRadius: number
	private controlledShapeId?: string
	private collisionPadding = 0.3
	private minRadius: number

	constructor(scene: Scene, targetPosition: Vector3, alpha: number, beta: number, shapeHeight: number, shapeDepth: number) {
		const eyeHeight = shapeHeight * 0.7
		const radius = Math.max(2, shapeDepth * 3 + shapeHeight)
		const initialTarget = targetPosition.add(new Vector3(0, eyeHeight, 0))
		super('play-camera', alpha, beta, radius, initialTarget, scene)
		this.eyeOffset = new Vector3(0, eyeHeight, 0)
		this.desiredRadius = radius
		this.minRadius = Math.max(1, shapeDepth * 2)
		this.lowerRadiusLimit = this.minRadius
		this.upperRadiusLimit = 20

		this.wheelDeltaPercentage = 0.05
		this.angularSensibilityX = 500
		this.angularSensibilityY = 500
		this.panningSensibility = 0

		this.attachControl(true)
		this.inputs.removeByType('ArcRotateCameraKeyboardMoveInput')
	}

	setControlledShape(shape: { id: string; height: number; depth: number }) {
		this.controlledShapeId = shape.id
		this.eyeOffset = new Vector3(0, shape.height * 0.7, 0)
		this.minRadius = Math.max(1, shape.depth * 2)
		this.lowerRadiusLimit = this.minRadius
		this.desiredRadius = Math.max(this.minRadius, Math.min(20, shape.depth * 3 + shape.height))
	}

	follow(position: Vector3) {
		const targetPos = position.add(this.eyeOffset)

		// horizontal follows tighter, vertical floats softer
		this.target.x += (targetPos.x - this.target.x) * 0.15
		this.target.z += (targetPos.z - this.target.z) * 0.15
		this.target.y += (targetPos.y - this.target.y) * 0.05

		this.desiredRadius = Math.max(2, Math.min(20, this.desiredRadius + this.inertialRadiusOffset))
		this.checkCollision()
	}

	private checkCollision() {
		const scene = this.getScene()
		const direction = this.position.subtract(this.target).normalize()
		const rayOrigin = this.target.add(direction.scale(this.minRadius))
		const rayLength = Math.max(0, this.desiredRadius - this.minRadius)
		if (rayLength <= 0) return
		const ray = new Ray(rayOrigin, direction, rayLength)

		const hit = scene.pickWithRay(ray, (mesh, thinInstanceIndex) => {
			if (!ShapeMesh.only(mesh, thinInstanceIndex)) return false
			return mesh.id !== this.controlledShapeId
		})

		if (hit?.hit) {
			this.radius = Math.max(this.minRadius, hit.distance + this.minRadius - this.collisionPadding)
		} else {
			this.radius = this.desiredRadius
		}
	}

	pickShapeInView(): string | null {
		const scene = this.getScene()
		const direction = this.target.subtract(this.position).normalize()
		const ray = new Ray(this.target, direction, 100)

		const hit = scene.pickWithRay(ray, (mesh, thinInstanceIndex) => {
			if (!ShapeMesh.only(mesh, thinInstanceIndex)) return false
			return mesh.id !== this.controlledShapeId
		})

		if (hit?.hit && hit.pickedMesh) {
			return hit.pickedMesh.id
		}
		return null
	}
}
