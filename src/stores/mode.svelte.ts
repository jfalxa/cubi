export type Mode = 'edit' | 'play'

export class ModeStore {
	mode = $state<Mode>('edit')
	shapeId = $state<string | null>(null)

	playAsShape(shapeId: string) {
		this.shapeId = shapeId
		this.mode = 'play'
	}

	edit() {
		this.mode = 'edit'
		this.shapeId = null
	}
}
