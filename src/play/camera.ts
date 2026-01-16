import { ArcRotateCamera, Vector3, type Scene } from '@babylonjs/core'

export class PlayCamera extends ArcRotateCamera {
	private eyeOffset = new Vector3(0, 1, 0)

	constructor(scene: Scene, targetPosition: Vector3, alpha: number, beta: number, radius: number) {
		const clampedRadius = Math.max(2, Math.min(20, radius))
		const initialTarget = targetPosition.add(new Vector3(0, 1, 0))
		super('play-camera', alpha, beta, clampedRadius, initialTarget, scene)
		this.lowerRadiusLimit = 2
		this.upperRadiusLimit = 20

		this.wheelDeltaPercentage = 0.05
		this.angularSensibilityX = 500
		this.angularSensibilityY = 500
		this.panningSensibility = 0

		this.attachControl(true)
		this.inputs.removeByType('ArcRotateCameraKeyboardMoveInput')
	}

	follow(position: Vector3) {
		const beta = this.beta
		this.target = position.add(this.eyeOffset)
		this.beta = beta
		this.inertialBetaOffset = 0
	}
}
