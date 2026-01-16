import { ArcRotateCamera, Ray, Vector3, type Scene } from '@babylonjs/core'
import { ShapeMesh } from '$/stage/mesh'

export class PlayCamera extends ArcRotateCamera {
	private eyeOffset = new Vector3(0, 1, 0)
	private desiredRadius: number
	private controlledShapeId?: string
	private collisionPadding = 0.3

	constructor(scene: Scene, targetPosition: Vector3, alpha: number, beta: number, radius: number) {
		const clampedRadius = Math.max(2, Math.min(20, radius))
		const initialTarget = targetPosition.add(new Vector3(0, 1, 0))
		super('play-camera', alpha, beta, clampedRadius, initialTarget, scene)
		this.desiredRadius = clampedRadius
		this.lowerRadiusLimit = 0.5
		this.upperRadiusLimit = 20

		this.wheelDeltaPercentage = 0.05
		this.angularSensibilityX = 500
		this.angularSensibilityY = 500
		this.panningSensibility = 0

		this.attachControl(true)
		this.inputs.removeByType('ArcRotateCameraKeyboardMoveInput')
	}

	setControlledShape(shapeId: string) {
		this.controlledShapeId = shapeId
	}

	follow(position: Vector3) {
		const beta = this.beta
		this.target = position.add(this.eyeOffset)
		this.beta = beta
		this.inertialBetaOffset = 0

		this.desiredRadius = Math.max(2, Math.min(20, this.desiredRadius + this.inertialRadiusOffset))
		this.checkCollision()
	}

	private checkCollision() {
		const scene = this.getScene()
		const direction = this.position.subtract(this.target).normalize()
		const ray = new Ray(this.target, direction, this.desiredRadius)

		const hit = scene.pickWithRay(ray, (mesh, thinInstanceIndex) => {
			if (!ShapeMesh.only(mesh, thinInstanceIndex)) return false
			return mesh.id !== this.controlledShapeId
		})

		if (hit?.hit && hit.distance < this.desiredRadius) {
			this.radius = Math.max(0.5, hit.distance - this.collisionPadding)
		} else {
			this.radius = this.desiredRadius
		}
	}
}
