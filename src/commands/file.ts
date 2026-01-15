import type { ShapeStore } from "$/stores/shape.svelte";
import { parseShapes, stringifyShapes } from "$/utils/shape";

import type { Command } from ".";

export class OpenCommand implements Command {
  label = "Open";
  group = "file";

  shortcuts = ["ctrl+o", "command+o"];

  input: HTMLInputElement;

  constructor(private shapes: ShapeStore) {
    this.input = document.createElement("input");
    this.input.type = "file";
    this.input.hidden = true;
    this.input.addEventListener("change", this.handleOpen);
  }

  mount(container: HTMLElement) {
    container.append(this.input);
  }

  isAvailable() {
    return true;
  }

  execute(): void {
    this.input.click();
  }

  handleOpen = async () => {
    const file = this.input.files?.[0];
    if (!file) return;

    const content = await file.text();
    const shapes = parseShapes(content);

    this.shapes.reset(shapes);
  };
}

export class SaveCommand implements Command {
  label = "Save";
  group = "file";

  shortcuts = ["ctrl+s", "command+s"];

  constructor(private shapes: ShapeStore) {}

  isAvailable() {
    return this.shapes.current.length > 0;
  }

  execute(): void {
    const serialized = stringifyShapes(this.shapes.current);
    const blob = new Blob([serialized], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "cubi.json";
    a.click();

    URL.revokeObjectURL(url);
  }
}
