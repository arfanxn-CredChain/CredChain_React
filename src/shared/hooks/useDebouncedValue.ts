import { useEffect, useState } from "react";

/**
 * Returns a debounced version of `value` after `delay` ms.
 * Useful for search inputs to avoid firing a request on every keystroke.
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handle);
  }, [value, delay]);

  return debounced;
}
