import { Vector3, type Observer, type Scene } from '@babylonjs/core'
import hotkeys from 'hotkeys-js'

import type { ShapeStore } from '$/stores/shape.svelte'
import type { ModeStore } from '$/stores/mode.svelte'
import type { Stage } from '$/stage'

import { KeyboardInput } from './input'
import { PlayCamera } from './camera'
import { Movement } from './movement'

export class PlayMode {
	private stage: Stage
	private shapes: ShapeStore
	private mode: ModeStore

	private input?: KeyboardInput
	private camera?: PlayCamera
	private movement?: Movement
	private observer?: Observer<Scene>

	private shapeId?: string
	private previousScope?: string

	constructor(stage: Stage, shapes: ShapeStore, mode: ModeStore) {
		this.stage = stage
		this.shapes = shapes
		this.mode = mode
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
			editorCamera.beta,
			editorCamera.radius
		)
		this.movement = new Movement(this.input, this.camera)

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

		this.stage.view.scene.activeCamera = this.stage.camera

		this.stage.interactions.enabled = true

		hotkeys.unbind('escape', 'play')
		if (this.previousScope) {
			hotkeys.setScope(this.previousScope)
		}

		this.shapeId = undefined
	}

	private update = () => {
		if (!this.shapeId || !this.movement || !this.camera) return

		const shape = this.shapes.current.find(s => s.id === this.shapeId)
		if (!shape) {
			this.mode.edit()
			return
		}

		const deltaTime = this.stage.view.engine.getDeltaTime() / 1000

		const newPosition = this.movement.update(shape.position, deltaTime)

		if (!newPosition.equals(shape.position)) {
			this.shapes.patch({ id: this.shapeId, position: newPosition })
		}

		this.camera.follow(newPosition)
	}
}
