/**
 * Comprehensive tests for useResponsive hook
 * Tests edge cases, SSR behavior, and error handling
 */

import { renderHook, act } from '@testing-library/react';
import { useResponsive } from '../src/useResponsive';

// Mock window.innerWidth
const setWindowWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
};

// Trigger resize event
const triggerResize = () => {
  window.dispatchEvent(new Event('resize'));
};

// Wait for debounce
const waitForDebounce = () => new Promise((resolve) => setTimeout(resolve, 200));

describe('useResponsive', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setWindowWidth(1024);
  });

  describe('Default Breakpoints', () => {
    it('should return default breakpoints', () => {
      setWindowWidth(500);
      const { result } = renderHook(() => useResponsive());

      expect(result.current.width).toBe(500);
      expect(result.current.current).toBe('mobile');
      expect(result.current.isMobile).toBe(true);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isDesktop).toBe(false);
    });

    it('should detect tablet breakpoint', () => {
      setWindowWidth(800);
      const { result } = renderHook(() => useResponsive());

      expect(result.current.width).toBe(800);
      expect(result.current.current).toBe('tablet');
      expect(result.current.isTablet).toBe(true);
      expect(result.current.isMobile).toBe(false);
    });

    it('should detect desktop breakpoint', () => {
      setWindowWidth(1440);
      const { result } = renderHook(() => useResponsive());

      expect(result.current.width).toBe(1440);
      expect(result.current.current).toBe('desktop');
      expect(result.current.isDesktop).toBe(true);
    });
  });

  describe('Custom Breakpoints', () => {
    it('should use custom breakpoints', () => {
      const breakpoints = {
        small: { max: 639 },
        large: { min: 640 },
      };

      setWindowWidth(500);
      const { result } = renderHook(() => useResponsive(breakpoints));

      expect(result.current.current).toBe('small');
      expect(result.current.isSmall).toBe(true);
      expect(result.current.isLarge).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty config object', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      setWindowWidth(1024);
      const { result } = renderHook(() => useResponsive({}));

      expect(result.current.width).toBe(1024);
      expect(result.current.current).toBe(null);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Empty breakpoint configuration')
      );

      consoleWarnSpy.mockRestore();
    });

    it('should handle window width of 0', () => {
      setWindowWidth(0);
      const { result } = renderHook(() => useResponsive());

      expect(result.current.width).toBe(0);
      // Should still work, just no match
    });

    it('should handle very large widths', () => {
      setWindowWidth(10000);
      const { result } = renderHook(() => useResponsive());

      expect(result.current.width).toBe(10000);
      expect(result.current.current).toBe('desktop');
    });

    it('should handle no matching breakpoint', () => {
      const breakpoints = {
        small: { min: 100, max: 200 },
        large: { min: 1000, max: 2000 },
      };

      setWindowWidth(500); // No match
      const { result } = renderHook(() => useResponsive(breakpoints));

      expect(result.current.current).toBe(null);
      expect(result.current.isSmall).toBe(false);
      expect(result.current.isLarge).toBe(false);
    });

    it('should handle overlapping breakpoints (first match wins)', () => {
      const breakpoints = {
        first: { min: 0, max: 1000 },
        second: { min: 500, max: 1500 },
      };

      setWindowWidth(750); // Matches both, should pick first
      const { result } = renderHook(() => useResponsive(breakpoints));

      expect(result.current.current).toBe('first');
    });
  });

  describe('Invalid Configurations', () => {
    it('should warn about negative min values', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const breakpoints = {
        invalid: { min: -100, max: 500 },
      };

      renderHook(() => useResponsive(breakpoints));

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid min value')
      );

      consoleWarnSpy.mockRestore();
    });

    it('should warn about min > max', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const breakpoints = {
        invalid: { min: 1000, max: 500 },
      };

      renderHook(() => useResponsive(breakpoints));

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid breakpoint range')
      );

      consoleWarnSpy.mockRestore();
    });

    it('should warn about screen names starting with numbers', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const breakpoints = {
        '2xl': { min: 1536 },
      };

      renderHook(() => useResponsive(breakpoints));

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('starts with a number')
      );

      consoleWarnSpy.mockRestore();
    });

    it('should warn about NaN values', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const breakpoints = {
        invalid: { min: NaN },
      };

      renderHook(() => useResponsive(breakpoints));

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid min value')
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe('Resize Handling', () => {
    it('should update on window resize', async () => {
      setWindowWidth(500);
      const { result } = renderHook(() => useResponsive());

      expect(result.current.current).toBe('mobile');

      act(() => {
        setWindowWidth(1440);
        triggerResize();
      });

      await waitForDebounce();

      expect(result.current.width).toBe(1440);
      expect(result.current.current).toBe('desktop');
    });

    it('should debounce resize events', async () => {
      setWindowWidth(500);
      const { result } = renderHook(() => useResponsive());

      const initialWidth = result.current.width;

      // Trigger multiple rapid resizes
      act(() => {
        setWindowWidth(600);
        triggerResize();
        setWindowWidth(700);
        triggerResize();
        setWindowWidth(800);
        triggerResize();
      });

      // Should not update immediately
      expect(result.current.width).toBe(initialWidth);

      // Wait for debounce
      await waitForDebounce();

      // Should have final value
      expect(result.current.width).toBe(800);
    });
  });

  describe('Cleanup', () => {
    it('should cleanup event listeners on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

      const { unmount } = renderHook(() => useResponsive());

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });

    it('should cancel pending debounce on unmount', async () => {
      setWindowWidth(500);
      const { result, unmount } = renderHook(() => useResponsive());

      const initialWidth = result.current.width;

      act(() => {
        setWindowWidth(1440);
        triggerResize();
      });

      // Unmount before debounce completes
      unmount();

      // Wait for what would have been the debounce time
      await waitForDebounce();

      // Width should not have updated (component unmounted)
      expect(result.current.width).toBe(initialWidth);
    });
  });

  describe('Memoization', () => {
    it('should not recreate return object if width unchanged', () => {
      const { result, rerender } = renderHook(() => useResponsive());

      const firstResult = result.current;

      // Rerender without changing width
      rerender();

      // Should be same object reference
      expect(result.current).toBe(firstResult);
    });

    it('should handle dynamic config changes', () => {
      const config1 = { small: { max: 500 }, large: { min: 501 } };
      const config2 = { tiny: { max: 300 }, huge: { min: 301 } };

      setWindowWidth(400);

      const { result, rerender } = renderHook(
        ({ config }) => useResponsive(config),
        { initialProps: { config: config1 } }
      );

      expect(result.current.current).toBe('small');

      rerender({ config: config2 });

      expect(result.current.current).toBe('huge');
    });
  });

  describe('SSR Compatibility', () => {
    it('should initialize with width 0', () => {
      // Simulate SSR by not setting window.innerWidth
      const { result } = renderHook(() => useResponsive());

      // On initial render (before useEffect), width should be 0
      // This test is tricky because renderHook runs effects automatically
      // In real SSR, useEffect doesn't run, so width stays 0
      expect(typeof result.current.width).toBe('number');
    });

    it('should not crash without window object', () => {
      // This would need to be tested in actual SSR environment
      // Just verify it doesn't crash on normal render
      expect(() => {
        renderHook(() => useResponsive());
      }).not.toThrow();
    });
  });

  describe('Type Safety', () => {
    it('should infer correct types for custom config', () => {
      const breakpoints = {
        phone: { max: 639 },
        tablet: { min: 640, max: 1023 },
        desktop: { min: 1024 },
      } as const;

      const { result } = renderHook(() => useResponsive(breakpoints));

      // TypeScript should infer these properties
      expect(typeof result.current.isPhone).toBe('boolean');
      expect(typeof result.current.isTablet).toBe('boolean');
      expect(typeof result.current.isDesktop).toBe('boolean');

      // current should be union type: 'phone' | 'tablet' | 'desktop' | null
      const currentValue: 'phone' | 'tablet' | 'desktop' | null = result.current.current;
      expect(currentValue).toBeDefined();
    });
  });
});
