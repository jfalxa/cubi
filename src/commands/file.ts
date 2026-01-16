import type { SelectionStore } from "$/stores/selection.svelte";
import type { ShapeStore } from "$/stores/shape.svelte";
import type { Shape } from "$/types";
import { parseShapes, stringifyShapes } from "$/utils/shape";

import type { Command } from ".";

class FileReadCommand implements Command {
  label = "";
  group = "";

  private input: HTMLInputElement;
  protected partial = false;

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

    if (this.partial) {
      this.shapes.add(...shapes);
    } else {
      this.shapes.reset(shapes);
    }
  };
}

class FileWriteCommand implements Command {
  label = "";
  group = "";

  protected partial = false;

  constructor(private shapes: ShapeStore) {}

  isAvailable(context: Shape[]) {
    if (this.partial) {
      return context.length > 0;
    } else {
      return this.shapes.current.length > 0;
    }
  }

  execute(context: Shape[]): void {
    const shapes = this.partial ? context : this.shapes.current;
    const serialized = stringifyShapes(shapes);

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

export class OpenCommand extends FileReadCommand {
  label = "Open";
  group = "file";
  shortcuts = ["ctrl+o", "command+o"];
}

export class SaveCommand extends FileWriteCommand {
  label = "Save";
  group = "file";
  shortcuts = ["ctrl+s", "command+s"];
}

export class ImportCommand extends FileReadCommand {
  label = "Import";
  group = "component";
  shortcuts = ["ctrl+i", "command+i"];
  partial = true;
}

export class ExportCommand extends FileWriteCommand {
  label = "Export";
  group = "component";
  shortcuts = ["ctrl+e", "command+e"];
  partial = true;
}
