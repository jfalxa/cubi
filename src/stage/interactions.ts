import type { Stage } from "$/stage";
import { Pointer, type PointerInfo } from "$/stage/pointer";

export interface Intent {
  type: string;
}

export function createIntent(type: string): Intent {
  return { type };
}

export interface Interactive {
  proposeIntent(context: Context): Intent | undefined;
  applyIntent(intent: Intent, context: Context): boolean | void;
}

export interface Context {
  locked: boolean;
  info: PointerInfo;
}

export class Interactions {
  stage: Stage;
  pointer: Pointer;

  enabled: boolean;
  locked: boolean;
  interactives: Interactive[] = [];

  constructor(stage: Stage) {
    this.stage = stage;
    this.pointer = new Pointer(stage.view, this.process);
    this.enabled = true;
    this.locked = false;
  }

  dispose(): void {
    this.locked = false;
    this.interactives = [];
    this.pointer.dispose();
  }

  register(interactive: Interactive): void {
    this.interactives.push(interactive);
  }

  unregister(interactive: Interactive): void {
    const index = this.interactives.indexOf(interactive);
    if (index >= 0) this.interactives.splice(index, 1);
  }

  process = (info: PointerInfo) => {
    if (!this.enabled) return;
    const context: Context = { locked: this.locked, info };

    const intents: [Interactive, Intent][] = [];
    for (const interactive of this.interactives) {
      const intent = interactive.proposeIntent(context);
      if (intent) intents.push([interactive, intent]);
    }

    if (intents.length === 0) return;

    const [interactive, intent] = intents[0];

    const locked = interactive.applyIntent(intent, context);
    if (locked !== undefined) this.locked = locked;
  };
}

export function hasShift(context: Context) {
  return context.info.event.shiftKey;
}

export function hasCtrl(context: Context) {
  return context.info.event.ctrlKey || context.info.event.metaKey;
}

export function hasAlt(context: Context) {
  return context.info.event.altKey;
}
