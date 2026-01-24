export interface Colors {
  scene: string;
  grid: string;
  major: string;
  mid: string;
  minor: string;
  ghost: string;
  guide: string;
}

export const darkColors: Colors = {
  scene: "#101828",
  grid: "#2a2c3280",
  major: "#5f636e",
  mid: "#454954",
  minor: "#343842",
  ghost: "#00bcff",
  guide: "#f59e0b",
};

export const lightColors: Colors = {
  scene: "#f3f4f6",
  grid: "#e5e7ec80",
  major: "#9aa0ad",
  mid: "#b4b9c4",
  minor: "#cfd3db",
  ghost: "#00bcff",
  guide: "#f59e0b",
};

export function isDarkMode() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function getColors(darkMode = isDarkMode()) {
  return darkMode ? darkColors : lightColors;
}

export function watchAppearance(callback: (colors: Colors) => void) {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  const onChange = (event: MediaQueryListEvent) => {
    callback(getColors(event.matches));
  };

  mediaQuery.addEventListener("change", onChange);
  return () => mediaQuery.removeEventListener("change", onChange);
}
