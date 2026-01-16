export class KeyboardInput {
	private pressed = new Set<string>()

	constructor() {
		window.addEventListener('keydown', this.onKeyDown)
		window.addEventListener('keyup', this.onKeyUp)
	}

	dispose() {
		window.removeEventListener('keydown', this.onKeyDown)
		window.removeEventListener('keyup', this.onKeyUp)
		this.pressed.clear()
	}

	private onKeyDown = (event: KeyboardEvent) => {
		this.pressed.add(event.code)
	}

	private onKeyUp = (event: KeyboardEvent) => {
		this.pressed.delete(event.code)
	}

	isDown(code: string) {
		return this.pressed.has(code)
	}

	get forward() {
		return this.isDown('KeyW')
	}

	get backward() {
		return this.isDown('KeyS')
	}

	get left() {
		return this.isDown('KeyA')
	}

	get right() {
		return this.isDown('KeyD')
	}

	get up() {
		return this.isDown('Space')
	}

	get down() {
		return this.isDown('ControlLeft') || this.isDown('ControlRight')
	}
}
