# Accessibility Quick Reference Guide

## Common Patterns

### 1. Form Input with Label
```tsx
<label htmlFor="input-id" className="label">
  Label Text
</label>
<input
  id="input-id"
  type="text"
  aria-label="Descriptive label for screen readers"
  className="input"
/>
```

### 2. Button with Icon
```tsx
<button
  onClick={handleClick}
  aria-label="Descriptive action"
  className="btn"
>
  <svg aria-hidden="true">
    {/* Icon */}
  </svg>
  <span>Button Text</span>
</button>
```

### 3. Modal/Dialog
```tsx
const DialogComponent = ({ isOpen, onClose }) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      dialogRef.current?.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="overlay"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        tabIndex={-1}
      >
        <h2 id="dialog-title">Dialog Title</h2>
        {/* Content */}
      </div>
    </>
  );
};
```

### 4. Live Region (Dynamic Content)
```tsx
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
>
  {statusMessage}
</div>
```

### 5. Skip Link
```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-lg"
>
  Skip to main content
</a>
```

### 6. Screen Reader Only Text
```tsx
<span className="sr-only">
  This text is only for screen readers
</span>
```

## ARIA Attributes Reference

### Roles
- `role="dialog"` - Modal dialogs
- `role="navigation"` - Navigation sections
- `role="complementary"` - Sidebars
- `role="main"` - Main content (use `<main>` instead)
- `role="status"` - Status messages
- `role="log"` - Chat messages, logs
- `role="application"` - Interactive widgets (use sparingly)

### States
- `aria-expanded="true|false"` - Expandable elements
- `aria-selected="true|false"` - Selected items
- `aria-checked="true|false"` - Checkboxes
- `aria-disabled="true|false"` - Disabled elements
- `aria-hidden="true|false"` - Hidden from screen readers
- `aria-current="page"` - Current page in navigation

### Properties
- `aria-label="text"` - Accessible name
- `aria-labelledby="id"` - Reference to label element
- `aria-describedby="id"` - Reference to description
- `aria-live="polite|assertive"` - Live region politeness
- `aria-atomic="true|false"` - Announce entire region
- `aria-relevant="additions|removals|text|all"` - What changes to announce
- `aria-modal="true"` - Modal behavior

## Keyboard Navigation

### Standard Keys
- **Tab** - Move to next focusable element
- **Shift+Tab** - Move to previous focusable element
- **Enter** - Activate button/link
- **Space** - Activate button, toggle checkbox
- **Escape** - Close dialog/menu
- **Arrow Keys** - Navigate within component

### Focus Management
```tsx
// Focus element on mount
useEffect(() => {
  elementRef.current?.focus();
}, []);

// Focus trap in modal
const handleTabKey = (e: KeyboardEvent) => {
  const focusableElements = dialog.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (e.shiftKey && document.activeElement === firstElement) {
    lastElement.focus();
    e.preventDefault();
  } else if (!e.shiftKey && document.activeElement === lastElement) {
    firstElement.focus();
    e.preventDefault();
  }
};
```

## CSS Utilities

### Screen Reader Only
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.focus\:not-sr-only:focus {
  position: static;
  width: auto;
  height: auto;
  padding: inherit;
  margin: inherit;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

### Focus Styles
```css
*:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
  border-radius: var(--radius-md);
}
```

## Testing Checklist

### Keyboard Testing
- [ ] All interactive elements reachable via Tab
- [ ] Tab order is logical
- [ ] Focus indicators are visible
- [ ] Escape closes dialogs
- [ ] Enter/Space activates buttons
- [ ] No keyboard traps

### Screen Reader Testing
- [ ] All images have alt text
- [ ] Form labels are announced
- [ ] Buttons have descriptive names
- [ ] Dynamic content is announced
- [ ] Heading hierarchy is logical
- [ ] Landmarks are properly labeled

### Visual Testing
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Text is readable at 200% zoom
- [ ] Focus indicators are visible
- [ ] No information conveyed by color alone

## Common Mistakes to Avoid

### ❌ Don't
```tsx
// Missing label
<input type="text" placeholder="Search" />

// Div button without role
<div onClick={handleClick}>Click me</div>

// Icon without label
<button onClick={handleClick}>
  <svg>...</svg>
</button>

// Decorative image with alt text
<img src="decoration.png" alt="Decorative image" />
```

### ✅ Do
```tsx
// Proper label
<label htmlFor="search">Search</label>
<input id="search" type="text" placeholder="Search" />

// Use button element
<button onClick={handleClick}>Click me</button>

// Icon with label
<button onClick={handleClick} aria-label="Close dialog">
  <svg aria-hidden="true">...</svg>
</button>

// Decorative image
<img src="decoration.png" alt="" aria-hidden="true" />
```

## Resources

- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Articles](https://webaim.org/articles/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

## Tools

- **axe DevTools** - Browser extension for accessibility testing
- **WAVE** - Web accessibility evaluation tool
- **Lighthouse** - Chrome DevTools accessibility audit
- **NVDA** - Free screen reader for Windows
- **VoiceOver** - Built-in macOS screen reader
