import type { ShapeStore } from "$/stores/shape.svelte";
import type { Shape } from "$/types";

import type { Command } from ".";

export class ColorsCommand implements Command {
  label = "Colors";
  group = "colors";

  options = {
    Red: "#fa003f",
    Blue: "#004dff",
    Yellow: "#ffd400",
    Green: "#00b874",
    Orange: "#ff5a00",
    Purple: "#6a00ff",
    Black: "#0f0f0f",
    White: "#ffffff",
    Gray: "#7c7c8a",
    Brown: "#9c4f19",
    Pink: "#ff2f6d",
  };

  constructor(private shapes: ShapeStore) {}

  isAvailable(context: Shape[]) {
    return context.length > 0;
  }

  execute(context: Shape[], color: string): void {
    this.shapes.update(...context.map((s) => ({ ...s, color })));
  }
}
