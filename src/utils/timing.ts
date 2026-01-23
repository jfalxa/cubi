export function debounce<T extends unknown[]>(
  callback: (...args: T) => void,
  delay = 200,
) {
  let timeoutTimer: ReturnType<typeof setTimeout>;

  return (...args: T) => {
    clearTimeout(timeoutTimer);

    timeoutTimer = setTimeout(() => {
      callback(...args);
    }, delay);
  };
}
