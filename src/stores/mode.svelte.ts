export type Mode = 'edit' | 'play'

export class ModeStore {
	mode = $state<Mode>('edit')
	shapeId = $state<string | null>(null)

	onEnterPlay?: (shapeId: string) => void
	onExitPlay?: () => void

	playAsShape(shapeId: string) {
		this.shapeId = shapeId
		this.mode = 'play'
		this.onEnterPlay?.(shapeId)
	}

	edit() {
		this.mode = 'edit'
		this.shapeId = null
		this.onExitPlay?.()
	}
}
