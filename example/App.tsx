import React from 'react';
import { useResponsive } from '../src';

/**
 * Example 1: Using default breakpoints
 */
function DefaultBreakpointsExample() {
  const { width, current, isMobile, isTablet, isDesktop } = useResponsive();

  return (
    <div style={{ padding: '20px', border: '2px solid #333', margin: '20px 0' }}>
      <h2>Default Breakpoints</h2>
      <p><strong>Current Width:</strong> {width}px</p>
      <p><strong>Active Screen:</strong> {current || 'None'}</p>
      <div>
        <label>
          <input type="checkbox" checked={isMobile} readOnly /> Mobile (0-767px)
        </label>
        <br />
        <label>
          <input type="checkbox" checked={isTablet} readOnly /> Tablet (768-1023px)
        </label>
        <br />
        <label>
          <input type="checkbox" checked={isDesktop} readOnly /> Desktop (1024px+)
        </label>
      </div>
    </div>
  );
}

/**
 * Example 2: Using custom breakpoints
 */
function CustomBreakpointsExample() {
  const breakpoints = {
    phone: { max: 639 },
    tablet: { min: 640, max: 1023 },
    laptop: { min: 1024, max: 1439 },
    desktop: { min: 1440 },
  };

  const { width, current, isPhone, isTablet, isLaptop, isDesktop } = useResponsive(breakpoints);

  return (
    <div style={{ padding: '20px', border: '2px solid #666', margin: '20px 0' }}>
      <h2>Custom Breakpoints</h2>
      <p><strong>Current Width:</strong> {width}px</p>
      <p><strong>Active Screen:</strong> {current || 'None'}</p>
      <div>
        <label>
          <input type="checkbox" checked={isPhone} readOnly /> Phone (0-639px)
        </label>
        <br />
        <label>
          <input type="checkbox" checked={isTablet} readOnly /> Tablet (640-1023px)
        </label>
        <br />
        <label>
          <input type="checkbox" checked={isLaptop} readOnly /> Laptop (1024-1439px)
        </label>
        <br />
        <label>
          <input type="checkbox" checked={isDesktop} readOnly /> Desktop (1440px+)
        </label>
      </div>
    </div>
  );
}

/**
 * Example 3: Tailwind-like breakpoints
 */
function TailwindBreakpointsExample() {
  const breakpoints = {
    sm: { min: 640 },
    md: { min: 768 },
    lg: { min: 1024 },
    xl: { min: 1280 },
    '2xl': { min: 1536 },
  };

  const { width, current, isSm, isMd, isLg, isXl, is2xl } = useResponsive(breakpoints);

  return (
    <div style={{ padding: '20px', border: '2px solid #999', margin: '20px 0' }}>
      <h2>Tailwind-like Breakpoints (Min-width only)</h2>
      <p><strong>Current Width:</strong> {width}px</p>
      <p><strong>Active Screen:</strong> {current || 'None'}</p>
      <div>
        <label>
          <input type="checkbox" checked={isSm} readOnly /> sm (640px+)
        </label>
        <br />
        <label>
          <input type="checkbox" checked={isMd} readOnly /> md (768px+)
        </label>
        <br />
        <label>
          <input type="checkbox" checked={isLg} readOnly /> lg (1024px+)
        </label>
        <br />
        <label>
          <input type="checkbox" checked={isXl} readOnly /> xl (1280px+)
        </label>
        <br />
        <label>
          <input type="checkbox" checked={is2xl} readOnly /> 2xl (1536px+)
        </label>
      </div>
    </div>
  );
}

/**
 * Main App component
 */
export default function App() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>useResponsive Hook Examples</h1>
      <p>Resize your browser window to see the hook in action!</p>

      <DefaultBreakpointsExample />
      <CustomBreakpointsExample />
      <TailwindBreakpointsExample />
    </div>
  );
}
