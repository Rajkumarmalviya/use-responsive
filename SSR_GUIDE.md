# SSR Implementation Guide

## Overview

`useResponsive` is designed to be **fully SSR-safe** and works seamlessly with Next.js, Gatsby, Remix, and other SSR frameworks.

---

## How It Works

### Server-Side Rendering

During SSR, the hook:
1. Returns `width: 0` (no window access)
2. Returns `current: null` (no active breakpoint)
3. Sets all boolean flags to `false`

```tsx
// Server-rendered HTML
const { width, current, isMobile } = useResponsive();
// width = 0
// current = null
// isMobile = false
```

### Client-Side Hydration

After hydration:
1. `useEffect` runs and immediately sets the actual window width
2. Breakpoint detection activates
3. Component updates with correct values

```tsx
// After useEffect runs
const { width, current, isMobile } = useResponsive();
// width = 375 (actual window width)
// current = 'mobile'
// isMobile = true
```

---

## Best Practices

### 1. Avoid Hydration Mismatches

**❌ Bad - Causes hydration mismatch:**

```tsx
function MyComponent() {
  const { isMobile } = useResponsive();
  
  // Server renders null, client renders content
  return isMobile ? <MobileNav /> : <DesktopNav />;
}
```

**✅ Good - Consistent initial render:**

```tsx
function MyComponent() {
  const { isMobile, current } = useResponsive();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Server and client both render loading state
  if (!mounted) {
    return <DefaultNav />;
  }
  
  // After hydration, show responsive content
  return isMobile ? <MobileNav /> : <DesktopNav />;
}
```

**✅ Better - Use CSS for initial render:**

```tsx
function MyComponent() {
  const { isMobile } = useResponsive();
  
  return (
    <>
      {/* CSS handles SSR, React handles interactivity */}
      <div className="block md:hidden">
        <MobileNav />
      </div>
      <div className="hidden md:block">
        <DesktopNav />
      </div>
    </>
  );
}
```

---

### 2. Next.js App Router

```tsx
// app/components/ResponsiveComponent.tsx
'use client';

import { useResponsive } from 'use-responsive';

export function ResponsiveComponent() {
  const { isMobile, isDesktop } = useResponsive();
  
  return (
    <div>
      {/* Your responsive logic */}
    </div>
  );
}
```

```tsx
// app/page.tsx
import { ResponsiveComponent } from './components/ResponsiveComponent';

export default function Page() {
  return <ResponsiveComponent />;
}
```

---

### 3. Next.js Pages Router

```tsx
// pages/index.tsx
import { useResponsive } from 'use-responsive';

export default function Page() {
  const { isMobile } = useResponsive();
  
  return (
    <div>
      {/* Your responsive logic */}
    </div>
  );
}
```

---

### 4. Gatsby

```tsx
// src/components/MyComponent.tsx
import React, { useState, useEffect } from 'react';
import { useResponsive } from 'use-responsive';

export function MyComponent() {
  const { isMobile } = useResponsive();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return <LoadingState />;
  }
  
  return isMobile ? <MobileView /> : <DesktopView />;
}
```

---

## Common Patterns

### Pattern 1: Progressive Enhancement

Start with a default layout, enhance with responsive behavior:

```tsx
function MyComponent() {
  const { current } = useResponsive();
  
  // Default desktop layout
  let layout = 'desktop';
  
  // Progressively enhance based on actual width
  if (current === 'mobile') {
    layout = 'mobile';
  } else if (current === 'tablet') {
    layout = 'tablet';
  }
  
  return <Layout variant={layout} />;
}
```

---

### Pattern 2: CSS + JavaScript Hybrid

Use CSS for visual layout, JavaScript for logic:

```tsx
function MyComponent() {
  const { isMobile } = useResponsive();
  
  return (
    <div className="responsive-container">
      {/* CSS handles layout */}
      <style jsx>{`
        .responsive-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        }
      `}</style>
      
      {/* JavaScript handles behavior */}
      <ImageGallery
        lazyLoad={isMobile}
        columns={isMobile ? 1 : 3}
      />
    </div>
  );
}
```

---

### Pattern 3: Deferred Hydration

Render placeholder, swap after mount:

```tsx
function MyComponent() {
  const { current } = useResponsive();
  const [hydrated, setHydrated] = useState(false);
  
  useEffect(() => {
    setHydrated(true);
  }, []);
  
  if (!hydrated) {
    // Server-rendered placeholder
    return (
      <div className="skeleton">
        Loading...
      </div>
    );
  }
  
  // Client-rendered content
  return (
    <ResponsiveContent screen={current} />
  );
}
```

---

## Performance Considerations

### Initial Render

The hook is optimized for SSR:
- No window access during render (SSR-safe)
- Immediate width detection on client mount (no flash)
- Debounced resize events (performance)

### Hydration Flash

To minimize visual changes during hydration:

1. **Use CSS media queries** for critical layout
2. **Defer non-critical responsive logic** until after mount
3. **Provide sensible defaults** that work on server and client

---

## Testing SSR

### Manual Testing

```bash
# Next.js
npm run build
npm start

# Check HTML source - should show width: 0
curl http://localhost:3000 | grep "width"
```

### Automated Testing

```tsx
import { renderToString } from 'react-dom/server';

test('SSR renders without errors', () => {
  const Component = () => {
    const { width, current } = useResponsive();
    return <div>{current || 'no match'}</div>;
  };
  
  // Should not crash
  const html = renderToString(<Component />);
  expect(html).toContain('no match');
});
```

---

## Troubleshooting

### Issue: Hydration Mismatch Warning

**Cause:** Server HTML doesn't match client HTML

**Solution:**
```tsx
// Add mounted check
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);

if (!mounted) return <Placeholder />;
```

---

### Issue: Flash of Wrong Content

**Cause:** Component shows default, then switches

**Solution:**
```tsx
// Use CSS for initial render
<div className="hidden md:block">Desktop</div>
<div className="md:hidden">Mobile</div>
```

---

### Issue: Width is 0 on Server

**Expected Behavior:** This is correct! The hook cannot know window width during SSR.

**Solution:** Design components to handle `width: 0` and `current: null` gracefully.

---

## Advanced: Custom SSR Width

If you need a specific width for SSR (e.g., mobile-first):

```tsx
// This is NOT built into the library (by design)
// But you can implement it yourself:

function useResponsiveWithSSR(defaultWidth = 375) {
  const { width, ...rest } = useResponsive();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  return {
    width: mounted ? width : defaultWidth,
    ...rest,
  };
}
```

---

## Summary

✅ **DO:**
- Handle initial `width: 0` gracefully
- Use CSS for critical layout
- Add mounted checks for conditional renders
- Test SSR builds

❌ **DON'T:**
- Access window during render
- Assume width is always available
- Create hydration mismatches
- Ignore SSR warnings

---

For more examples, see the [examples](./example) directory.
