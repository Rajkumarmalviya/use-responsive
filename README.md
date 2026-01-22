# use-responsive

> Lightweight, SSR-safe, type-safe React hook for responsive breakpoints with fully customizable screen names

[![npm version](https://img.shields.io/npm/v/use-responsive.svg)](https://www.npmjs.com/package/use-responsive)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

## Features

- 🎯 **Fully customizable** - Define your own screen names and breakpoints
- 🔒 **Type-safe** - Complete TypeScript support with auto-generated types
- ⚡ **SSR-safe** - Works perfectly with Next.js and other SSR frameworks
- 🪶 **Lightweight** - Zero dependencies (except React peer dependency)
- 🎨 **Great DX** - Full autocomplete for screen flags
- ⚙️ **Optimized** - Debounced resize events and memoized values
- 📖 **Well documented** - Comprehensive JSDoc comments

## Installation

```bash
npm install use-responsive
```

```bash
yarn add use-responsive
```

```bash
pnpm add use-responsive
```

## Basic Usage

### With Default Breakpoints

```tsx
import { useResponsive } from 'use-responsive';

function MyComponent() {
  const { width, current, isMobile, isTablet, isDesktop } = useResponsive();

  return (
    <div>
      <p>Current width: {width}px</p>
      <p>Active screen: {current}</p>
      {isMobile && <MobileNav />}
      {isTablet && <TabletNav />}
      {isDesktop && <DesktopNav />}
    </div>
  );
}
```

**Default breakpoints:**
- `mobile`: 0 - 767px
- `tablet`: 768 - 1023px
- `desktop`: 1024px+

### With Custom Breakpoints

```tsx
import { useResponsive } from 'use-responsive';

const breakpoints = {
  phone: { max: 639 },
  tablet: { min: 640, max: 1023 },
  laptop: { min: 1024, max: 1279 },
  desktop: { min: 1280 },
};

function MyComponent() {
  const { current, isPhone, isTablet, isLaptop, isDesktop } = useResponsive(breakpoints);

  return (
    <div>
      {isPhone && <p>Phone layout</p>}
      {isTablet && <p>Tablet layout</p>}
      {isLaptop && <p>Laptop layout</p>}
      {isDesktop && <p>Desktop layout</p>}
    </div>
  );
}
```

### Use Any Screen Names

```tsx
const breakpoints = {
  xs: { max: 475 },
  sm: { min: 476, max: 767 },
  md: { min: 768, max: 1023 },
  lg: { min: 1024, max: 1439 },
  xl: { min: 1440 },
};

function MyComponent() {
  const { current, isXs, isSm, isMd, isLg, isXl } = useResponsive(breakpoints);
  // Full autocomplete and type safety! ✨
}
```

## API

### `useResponsive(config?)`

#### Parameters

- `config` (optional): Object defining custom breakpoints

Each breakpoint can have:
- `min` (number, optional): Minimum width in pixels (default: 0)
- `max` (number, optional): Maximum width in pixels (default: Infinity)

#### Returns

An object with:
- `width` (number): Current window width in pixels
- `current` (string | null): Name of the currently active screen
- `is<ScreenName>` (boolean): Boolean flag for each defined screen name

**Note:** Screen names are automatically capitalized for the boolean flags.
- `mobile` → `isMobile`
- `tablet` → `isTablet`
- `desktop` → `isDesktop`

## SSR / Next.js Usage

The hook is **fully SSR-safe** and works with Next.js, Gatsby, Remix, and other SSR frameworks.

### ⚠️ Important SSR Considerations

During server-side rendering:
- `width` returns `0` (no window access)
- `current` returns `null` (no active breakpoint)
- All boolean flags return `false`

After client-side hydration, values update immediately to reflect actual window dimensions.

### Best Practice: Avoid Hydration Mismatches

```tsx
// ❌ Bad - causes hydration mismatch
function Bad() {
  const { isMobile } = useResponsive();
  return isMobile ? <Mobile /> : <Desktop />;
}

// ✅ Good - consistent initial render
function Good() {
  const { isMobile } = useResponsive();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => setMounted(true), []);
  
  if (!mounted) return <DefaultView />;
  return isMobile ? <Mobile /> : <Desktop />;
}
```

**📖 See [SSR_GUIDE.md](./SSR_GUIDE.md) for comprehensive SSR patterns and troubleshooting.**

### Next.js App Router

```tsx
// app/components/ResponsiveNav.tsx
'use client';

import { useResponsive } from 'use-responsive';

export function ResponsiveNav() {
  const { isMobile, isDesktop } = useResponsive();
  
  return (
    <nav>
      {isMobile && <MobileNav />}
      {isDesktop && <DesktopNav />}
    </nav>
  );
}
```

## How It Works

1. The hook listens to window resize events
2. On each resize (or initial mount), it checks which breakpoint matches
3. The **first matching breakpoint** in the config wins
4. Boolean flags are auto-generated from your screen names
5. Event listeners are properly cleaned up on unmount

## TypeScript Support

Full TypeScript support with type inference:

```tsx
const breakpoints = {
  mobile: { max: 767 },
  desktop: { min: 768 },
} as const;

const responsive = useResponsive(breakpoints);
// responsive.current is typed as: "mobile" | "desktop" | null
// responsive.isMobile is available with full autocomplete
// responsive.isDesktop is available with full autocomplete
```

## Performance

The hook is optimized for production use:

- **Debounced resize events** - Resize handler is debounced (150ms) to prevent excessive re-renders
- **Memoized values** - Return values are memoized to avoid unnecessary object creation
- **Efficient matching** - First-match algorithm for breakpoint detection

## Development

### Running Examples Locally

```bash
git clone https://github.com/yourusername/use-responsive.git
cd use-responsive
npm install
npm run dev
```

Open your browser to see live examples with different breakpoint configurations.

### Building

```bash
npm run build
```

### Type Checking

```bash
npm run type-check
```

## API Reference

### Types

```typescript
export type Breakpoint = {
  min?: number; // Minimum width in pixels (default: 0)
  max?: number; // Maximum width in pixels (default: Infinity)
};

export type BreakpointConfig = Record<string, Breakpoint>;

export type UseResponsiveReturn<T extends BreakpointConfig> = {
  width: number;
  current: keyof T | null;
} & BooleanFlags<T>;
```

## FAQ

**Q: Why does `current` return `null` on initial render?**  
A: During SSR, `window` is not available. The hook returns `width: 0` and `current: null` until client-side hydration.

**Q: Can I use this with CSS-in-JS libraries?**  
A: Absolutely! The boolean flags (`isMobile`, etc.) work great with styled-components, emotion, or any CSS-in-JS library.

**Q: How do I handle overlapping breakpoints?**  
A: The first matching breakpoint wins. Define your config in the order of precedence.

**Q: Does this work with React Native?**  
A: No, this hook uses `window.innerWidth` which is browser-specific. For React Native, use `Dimensions` from `react-native`.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history.

## License

MIT © use-responsive contributors

See [LICENSE](./LICENSE) for details.

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.
