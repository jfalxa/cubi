import { Vector3, type Observer, type Scene } from '@babylonjs/core'
import hotkeys from 'hotkeys-js'

import type { CameraStore } from '$/stores/camera.svelte'
import type { ShapeStore } from '$/stores/shape.svelte'
import type { ModeStore } from '$/stores/mode.svelte'
import type { Stage } from '$/stage'

import { KeyboardInput } from './input'
import { PlayCamera } from './camera'
import { Movement } from './movement'
import { Collision } from './collision'

export class PlayMode {
	private stage: Stage
	private shapes: ShapeStore
	private mode: ModeStore
	private cameraStore: CameraStore

	private input?: KeyboardInput
	private camera?: PlayCamera
	private movement?: Movement
	private collision?: Collision
	private observer?: Observer<Scene>

	private shapeId?: string
	private previousScope?: string

	constructor(stage: Stage, shapes: ShapeStore, mode: ModeStore, cameraStore: CameraStore) {
		this.stage = stage
		this.shapes = shapes
		this.mode = mode
		this.cameraStore = cameraStore
	}

	enter(shapeId: string) {
		const shape = this.shapes.current.find(s => s.id === shapeId)
		if (!shape) return

		this.shapeId = shapeId

		this.previousScope = hotkeys.getScope()
		hotkeys.setScope('play')

		hotkeys('escape', 'play', () => this.mode.edit())

		this.stage.interactions.enabled = false

		this.input = new KeyboardInput()

		const editorCamera = this.stage.camera
		this.camera = new PlayCamera(
			this.stage.view.scene,
			shape.position,
			editorCamera.alpha,
			Math.PI / 3,
			shape.height,
			shape.depth
		)
		this.camera.setControlledShape(shape)
		this.movement = new Movement(this.input, this.camera, this.stage.view.scene, shapeId)
		this.collision = new Collision(this.shapes, shapeId)
		this.mode.flying = false

		hotkeys('r', 'play', () => {
			this.movement?.toggleFlying()
			this.mode.flying = this.movement?.flying ?? false
		})

		hotkeys('e', 'play', () => this.switchShape())

		this.stage.view.scene.activeCamera = this.camera

		this.observer = this.stage.view.scene.onBeforeRenderObservable.add(this.update)
	}

	exit() {
		if (this.observer) {
			this.stage.view.scene.onBeforeRenderObservable.remove(this.observer)
			this.observer = undefined
		}

		this.input?.dispose()
		this.input = undefined

		this.camera?.dispose()
		this.camera = undefined

		this.movement = undefined
		this.collision = undefined

		this.stage.view.scene.activeCamera = this.stage.camera
		this.cameraStore.reset()

		this.stage.interactions.enabled = true

		hotkeys.unbind('escape', 'play')
		hotkeys.unbind('r', 'play')
		hotkeys.unbind('e', 'play')
		if (this.previousScope) {
			hotkeys.setScope(this.previousScope)
		}

		this.shapeId = undefined
	}

	private switchShape() {
		if (!this.camera || !this.input) return

		const targetId = this.camera.pickShapeInView()
		console.log('switchShape pick:', targetId)
		if (!targetId) return

		const shape = this.shapes.current.find(s => s.id === targetId)
		if (!shape) return

		this.shapeId = targetId
		this.camera.setControlledShape(shape)
		this.movement = new Movement(this.input, this.camera, this.stage.view.scene, targetId)
		this.collision = new Collision(this.shapes, targetId)
		this.mode.shapeId = targetId
	}

	private update = () => {
		if (!this.shapeId || !this.movement || !this.camera || !this.collision) return

		const shape = this.shapes.current.find(s => s.id === this.shapeId)
		if (!shape) {
			this.mode.edit()
			return
		}

		const deltaTime = this.stage.view.engine.getDeltaTime() / 1000

		const proposed = this.movement.update(shape.position, deltaTime)

		let finalPosition = proposed
		if (!this.movement.flying) {
			const bounds = { width: shape.width, height: shape.height, depth: shape.depth }
			const resolved = this.collision.resolve(shape.position, proposed, bounds)
			this.movement.setCollisionState(resolved.grounded, resolved.hitCeiling)
			finalPosition = resolved.position
		}

		if (!finalPosition.equals(shape.position)) {
			this.shapes.patch({ id: this.shapeId, position: finalPosition })
		}

		this.camera.follow(finalPosition)
	}
}
