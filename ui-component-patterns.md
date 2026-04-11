# FeatherType UI Development Guidelines

This document is the **single source of truth** for styling, colors, CSS, Tailwind usage, and component architecture in FeatherType. Following these patterns is mandatory.

---

## 1. The Atomic Commandments

### I. No Hardcoded Colors
Never use raw hex values (`#252526`), raw Tailwind grays (`text-gray-300`), or `bg-white`/`text-black` in components.
- **Wrong**: `className="bg-[#252526] text-gray-300 border-[#3e3e42]"`
- **Right**: `className="bg-editor-surface text-theme-text-secondary border-border"`
- **Rationale**: All colors must flow through `globals.css` `@theme` tokens so theming is centralized.
- **Exception**: CodeMirror cursor colors (`#ffffff`, `#000000`) are intentionally hardcoded for max contrast.

### II. No "Div Soup"
Avoid nested, unstyled `div` elements for layout. Use semantic layout primitives.
- **Wrong**: `<div><div className="flex gap-4">...</div></div>`
- **Right**: Use `<Stack>`, `<Flex>`, or `<Grid>` from `Layout.tsx`.

### III. Declarative Over Imperative
Prefer component props over massive inline `className` strings.
- **Wrong**: `<GlassCard className="hover:bg-white/5 cursor-pointer rounded-none border-l-0">`
- **Right**: `<GlassCard interactive rounded="none" border="subtle">`

### IV. Flat DOM Hierarchy
If a component can be styled using a single wrapper, do not add inner wrappers.
- **Wrong**: `<Section><div className="max-w-4xl mx-auto"><Grid>...</Grid></div></Section>`
- **Right**: `<Section size="md"><Grid>...</Grid></Section>`

### V. No Inline Theme Ternaries with Raw Values
When a component supports light/dark themes, both sides must use tokens.
- **Wrong**: `isDark ? 'bg-[#252526]' : 'bg-white'`
- **Right**: `isDark ? 'bg-editor-surface' : 'bg-editor-bg-light'`

---

## 2. Color Token Reference

All tokens are defined in `src/globals.css` under `@theme`. Use them via Tailwind classes (e.g., `bg-editor-surface`, `text-theme-primary`, `border-border-light`).

### Primary Theme
| Token | Value | Usage |
|---|---|---|
| `theme-primary` | `#0e639c` | Primary brand blue — buttons, accents, active states |
| `theme-accent` | (25% lighter) | Accent color — links, highlights |
| `theme-primary-hover` | `#1177bb` | Hover state for primary buttons |
| `theme-primary-border` | `#248ad2` | Border for primary buttons |

### Semantic Text (Marketing / Dark-only pages)
| Token | Value | Replaces |
|---|---|---|
| `theme-text` | `#f3f4f6` | `text-gray-100`, `text-white` (body) |
| `theme-text-secondary` | `#d1d5db` | `text-gray-300` |
| `theme-text-muted` | `#9ca3af` | `text-gray-400`, `text-gray-500` |

### Editor — Dark Mode
| Token | Value | Usage |
|---|---|---|
| `editor-bg` | `#1e1e1e` | Editor background |
| `editor-bg-deep` | `#121212` | Deep background (mockup gradient) |
| `editor-surface` | `#252526` | Panels, toolbars, tab bar |
| `editor-surface-raised` | `#2a2d2e` | Dialog headers/footers, elevated surfaces |
| `editor-text` | `#d4d4d4` | Editor body text |
| `editor-gutter-text` | `#858585` | Line numbers, labels |
| `editor-selection` | `#264f78` | Text selection |
| `editor-search-match` | `#515c6a` | Search match highlight |
| `tab-active` | `#2d2d2d` | Active tab, active line gutter |
| `tab-inactive` | `#252526` | Inactive tab |
| `border` | `#3e3e42` | All dark mode borders |
| `button-inactive-dark` | `#2d2d2d` | Secondary button bg |
| `button-hover-dark` | `#3e3e42` | Secondary button hover |

### Editor — Light Mode
| Token | Value | Usage |
|---|---|---|
| `editor-bg-light` | `#ffffff` | Editor background |
| `editor-surface-light` | `#f5f5f5` | Panels, toolbars, tab bar |
| `editor-surface-raised-light` | `#e8e8e8` | Elevated surfaces, active line gutter |
| `editor-text-light` | `#1e1e1e` | Editor body text |
| `editor-gutter-light` | `#f5f5f5` | Gutter background |
| `editor-gutter-text-light` | `#6e7681` | Line numbers, labels |
| `editor-selection-light` | `#add6ff` | Text selection |
| `editor-search-match-light` | `#e8c97a` | Search match highlight |
| `border-light` | `#d0d0d0` | All light mode borders |
| `text-light` | `#1e1e1e` | Primary text in light mode |
| `text-secondary-light` | `#374151` | Secondary text in light mode |
| `text-muted-light` | `#6b7280` | Muted text in light mode |
| `button-inactive-light` | `#f0f0f0` | Secondary button bg |
| `button-hover-light` | `#e5e7eb` | Secondary button hover |

### CodeMirror Themes (`Editor.tsx`)
CodeMirror themes use JavaScript style objects. Reference tokens via the `v()` helper:
```typescript
const v = (token: string) => `var(--color-${token})`;
// Usage: backgroundColor: v('editor-surface')
```
Cursor colors (`#ffffff`/`#000000`) and syntax highlight colors (`#4EC9B0`/`#0070C0`) are intentionally hardcoded.

---

## 3. Component Library

### Layout (`Layout.tsx`)
- **`Page`** — Full-page wrapper for marketing pages
- **`Section`** — Vertical block with `size` (sm/md/lg/xl) and `variant` (default/hero)
- **`Stack`** — Vertical flex with gap. Use `divider` prop for separators
- **`Flex`** — Horizontal flex with `justify`, `items`, `gap`
- **`Grid`** — CSS grid with `cols` and `divide` props

### Cards (`GlassCard.tsx`, `MarketingCard.tsx`)
- **`GlassCard`** — Base container with `variant` (default/muted/gradient/none), `padding`, `border`, `rounded`, `hoverable`, `interactive`
- **`MarketingCard`** — Unified card for features, social links. Uses `variant` (feature/access/social), `ctaLabel`, `href`

### Dialogs (`Dialog.tsx`)
- **`Dialog`** — Universal dialog. Supports `title`, `description`, `icon`, `children`, `actions`, `footer`
- **`actions` prop**: Array of `{ label, icon?, variant?, onClick }` for declarative button footers
- **Do not** build one-off modal markup. Always use `<Dialog>`

### Buttons (`Button.tsx`)
- Variants: `primary`, `secondary`, `ghost`, `destructive`
- Props: `iconOnly`, `isActive`, `fullWidth`, `animateIcon`, `to` (renders as Link), `disabled`
- **`destructive`**: Secondary at rest, red on hover. For discard/delete actions

### Typography (`Typography.tsx`)
- **`Subtle`** — Muted secondary text (`text-sm text-theme-text-muted`)
- **`Caption`** — Small uppercase labels. `variant="muted"` for non-accent captions

### Links (`ActionLink.tsx`)
- `variant="primary"` — Accent-colored link
- `variant="meta"` — Small uppercase, muted

### Utility
- **`Spacer`** — `<Spacer width={N} height={N} />` instead of empty divs
- **`Badge`** — Small labels. Variants: `default`, `success`, `info`, `outline`
- **`IconBox`** — Icon container. Sizes: `sm`/`md`/`lg`. Variants: `primary`/`secondary`/`ghost`

### Dropdown (`Dropdown.tsx`)
- Custom styled select replacement. Props: `value`, `onChange`, `options[]`, `isActive`
- Active item uses solid `bg-theme-primary`

### Accordion (`Accordion.tsx`)
- Compound component: `AccordionItem` → `AccordionTrigger` + `AccordionContent`
- Uses CSS grid transition for smooth open/close

---

## 4. Architecture Rules

### Tailwind v4
- Uses CSS-based `@theme` directive (not `tailwind.config.js`)
- Import via `@import "tailwindcss";` in `App.css`
- **`@apply` caveat**: Plugin classes like `prose`, `prose-invert` cannot be used with `@apply`. Keep them as inline utility classes

### Theme Handling
- Marketing pages are **always dark**. Use `text-theme-text`, `text-theme-text-muted` etc.
- Editor components support **light + dark** via store-based `isDark` ternary
- Both sides of the ternary must use **token classes**, never raw grays or hex

### File Organization
```
src/components/
  ui/           — Shared UI primitives (Layout, Badge, IconBox, etc.)
  marketing/    — Marketing-specific (MarketingCard, CTASection, EditorMockup)
  layout/       — Page layout (Navbar, Footer, ScrollToTop)
  [root]        — Editor components (Toolbar, TabBar, Tab, Editor, etc.)
```

### Mockup CSS Classes (`globals.css`)
| Class | Purpose |
|---|---|
| `.mockup-frame` | Outer frame sizing and shadow |
| `.mockup-titlebar` | Window title bar chrome |
| `.mockup-pane` | Shared pane padding/sizing |
| `.mockup-code` | Code/editor pane (mono font, border, opacity) |
| `.mockup-preview` | Preview pane (backdrop, bg — `prose` classes stay inline) |

---

## 5. Review Checklist

- [ ] Are ALL colors using theme tokens? No raw hex, no raw Tailwind grays
- [ ] Are light/dark ternaries using tokens on BOTH sides?
- [ ] Is any `className` string > 50 chars? → Extract to component variant or CSS class
- [ ] Using `<Stack>`, `<Flex>`, `<Grid>` for layout? No naked flex divs
- [ ] Using `<Spacer>` instead of empty styled `<div>` spacers?
- [ ] Using `<Dialog>` with `actions` for all modals?
- [ ] Using `<ActionLink>` for styled links, not inline `<span>` styling?
- [ ] Using `<Caption>`/`<Subtle>` for typography, not inline classes?
- [ ] Using `<MarketingCard>` for marketing content, not custom cards?
- [ ] Is `destructive` button variant used for delete/discard actions?
- [ ] CodeMirror themes using `v()` helper for token references?
