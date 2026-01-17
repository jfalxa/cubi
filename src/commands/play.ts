import type { ModeStore } from '$/stores/mode.svelte'
import type { Shape } from '$/types'

import type { Command } from '.'

export class PlayCommand implements Command {
	label = 'Play'
	group = 'mode'

	shortcuts = ['e']

	constructor(private mode: ModeStore) {}

	isAvailable(context: Shape[]) {
		return context.length === 1
	}

	execute(context: Shape[]): void {
		if (context.length !== 1) return
		this.mode.playAsShape(context[0].id)
	}
}
