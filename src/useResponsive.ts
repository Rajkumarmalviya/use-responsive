import { useState, useEffect, useMemo, useRef } from 'react';

/**
 * Defines the minimum and maximum width for a breakpoint.
 */
export type Breakpoint = {
  /** Minimum width in pixels (default: 0) */
  min?: number;
  /** Maximum width in pixels (default: Infinity) */
  max?: number;
};

/**
 * A configuration object mapping screen names to breakpoint definitions.
 */
export type BreakpointConfig = Record<string, Breakpoint>;

/**
 * Default breakpoint configuration.
 */
type DefaultBreakpoints = {
  mobile: Breakpoint;
  tablet: Breakpoint;
  desktop: Breakpoint;
};

const DEFAULT_BREAKPOINTS: DefaultBreakpoints = {
  mobile: { max: 767 },
  tablet: { min: 768, max: 1023 },
  desktop: { min: 1024 },
};

type Capitalize<T extends string> = T extends `${infer First}${infer Rest}`
  ? `${Uppercase<First>}${Rest}`
  : T;

type BooleanFlags<T extends BreakpointConfig> = {
  [K in keyof T as `is${Capitalize<string & K>}`]: boolean;
};

/**
 * The return type of the useResponsive hook.
 */
export type UseResponsiveReturn<T extends BreakpointConfig> = {
  /** Current window width in pixels */
  width: number;
  /** Name of the currently active screen, or null if none match */
  current: keyof T | null;
} & BooleanFlags<T>;

/**
 * Debounces a function call.
 */
function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): {
  (this: unknown, ...args: Parameters<T>): void;
  cancel: () => void;
} {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debounced = function (this: unknown, ...args: Parameters<T>) {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => fn(...args), delay);
  };

  debounced.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debounced;
}

/**
 * Validates a breakpoint configuration.
 */
function validateBreakpoint(name: string, breakpoint: Breakpoint): boolean {
  const { min, max } = breakpoint;

  // Check for invalid values
  if (min !== undefined) {
    if (typeof min !== 'number' || !Number.isFinite(min) || min < 0) {
      console.warn(
        `[useResponsive] Invalid min value for "${name}": ${min}. Must be a positive finite number.`
      );
      return false;
    }
  }

  if (max !== undefined) {
    if (typeof max !== 'number' || (!Number.isFinite(max) && max !== Infinity) || max < 0) {
      console.warn(
        `[useResponsive] Invalid max value for "${name}": ${max}. Must be a positive finite number or Infinity.`
      );
      return false;
    }
  }

  // Check for invalid range (min > max)
  if (min !== undefined && max !== undefined && min > max) {
    console.warn(
      `[useResponsive] Invalid breakpoint range for "${name}": min (${min}) > max (${max}).`
    );
    return false;
  }

  return true;
}

/**
 * Validates screen name for JavaScript identifier compatibility.
 */
function validateScreenName(name: string): boolean {
  if (!name || typeof name !== 'string') {
    console.warn(`[useResponsive] Invalid screen name: "${name}". Must be a non-empty string.`);
    return false;
  }

  // Warn about names that start with numbers (can't create valid camelCase)
  if (/^\d/.test(name)) {
    console.warn(
      `[useResponsive] Screen name "${name}" starts with a number. The generated flag "is${name}" may not be a valid identifier.`
    );
  }

  return true;
}

/**
 * Determines which screen is currently active based on window width.
 */
function getCurrentScreen<T extends BreakpointConfig>(
  width: number,
  config: T
): keyof T | null {
  const entries = Object.entries(config) as [keyof T, Breakpoint][];

  for (const [screenName, breakpoint] of entries) {
    const min = breakpoint.min ?? 0;
    const max = breakpoint.max ?? Infinity;

    if (width >= min && width <= max) {
      return screenName;
    }
  }

  return null;
}

/**
 * Generates boolean flags for each screen name (e.g., isMobile, isTablet).
 */
function generateBooleanFlags<T extends BreakpointConfig>(
  current: keyof T | null,
  config: T
): BooleanFlags<T> {
  const flags = {} as Record<string, boolean>;

  for (const screenName in config) {
    if (Object.prototype.hasOwnProperty.call(config, screenName)) {
      const flagName = `is${screenName.charAt(0).toUpperCase()}${screenName.slice(1)}`;
      flags[flagName] = current === screenName;
    }
  }

  return flags as BooleanFlags<T>;
}

// Function overload for no config (uses defaults)
export function useResponsive(): UseResponsiveReturn<DefaultBreakpoints>;

// Function overload for custom config
export function useResponsive<T extends BreakpointConfig>(
  config: T
): UseResponsiveReturn<T>;

/**
 * A React hook that provides responsive breakpoint information.
 *
 * @template T - The breakpoint configuration type
 * @param config - Optional custom breakpoint configuration
 * @returns An object containing current width, active screen name, and boolean flags
 *
 * @example
 * ```tsx
 * // Using default breakpoints
 * const { isMobile, isTablet, isDesktop } = useResponsive();
 *
 * // Using custom breakpoints
 * const breakpoints = {
 *   small: { max: 640 },
 *   large: { min: 641 }
 * };
 * const { isSmall, isLarge, current } = useResponsive(breakpoints);
 * ```
 */
export function useResponsive<T extends BreakpointConfig = DefaultBreakpoints>(
  config?: T
): UseResponsiveReturn<T extends undefined ? DefaultBreakpoints : T> {
  // Memoize breakpoints to prevent unnecessary recalculations
  const breakpoints = useMemo(() => {
    const bp = (config ?? DEFAULT_BREAKPOINTS) as T extends undefined
      ? DefaultBreakpoints
      : T;

    // Validate config in development
    if (process.env.NODE_ENV !== 'production') {
      const entries = Object.entries(bp);

      if (entries.length === 0) {
        console.warn(
          '[useResponsive] Empty breakpoint configuration provided. No breakpoints will match.'
        );
      }

      entries.forEach(([name, breakpoint]) => {
        validateScreenName(name);
        validateBreakpoint(name, breakpoint);
      });
    }

    return bp;
  }, [config]);

  const [width, setWidth] = useState<number>(0);

  // Track if this is the first mount (SSR-safe)
  const isFirstMount = useRef(true);

  // Memoize the debounced resize handler
  const debouncedSetWidth = useMemo(
    () => debounce((newWidth: number) => setWidth(newWidth), 150),
    []
  );

  useEffect(() => {
    // Set initial width immediately on mount (no debounce)
    const updateWidth = () => {
      setWidth(window.innerWidth);
    };

    const handleResize = () => {
      // Use debounced version for resize events
      debouncedSetWidth(window.innerWidth);
    };

    // Set width immediately on first mount
    if (isFirstMount.current) {
      updateWidth();
      isFirstMount.current = false;
    }

    // Listen for resize events
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      // Cancel any pending debounced calls
      debouncedSetWidth.cancel();
    };
  }, [debouncedSetWidth]); // Only depend on debouncedSetWidth, NOT width

  // Memoize the return value to prevent unnecessary re-renders
  return useMemo(() => {
    const current = getCurrentScreen(width, breakpoints);
    const flags = generateBooleanFlags(current, breakpoints);

    return {
      width,
      current,
      ...flags,
    } as UseResponsiveReturn<T extends undefined ? DefaultBreakpoints : T>;
  }, [width, breakpoints]);
}
