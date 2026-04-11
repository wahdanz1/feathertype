# FeatherType UI Development Guidelines

This document defines the architectural standards for building and maintaining the FeatherType marketing and application interface. **Following these patterns is mandatory.**

---

## 1. The Atomic Commandments

### I. No Hardcoded Colors
Never use raw Tailwind color strings (e.g., `text-blue-500`) for branding or theme elements.
- **Wrong**: `className="text-blue-400"`
- **Right**: `className="text-theme-primary"` or `className="text-theme-accent"`
- **Rationale**: Branding must be centrally controlled via theme variables to allow for easy global adjustments.

### II. No "Div Soup"
Avoid nested, unstyled `div` elements for layout. Use semantic layout primitives.
- **Wrong**: `<div><div className="flex gap-4">...</div></div>`
- **Right**: Use `<Stack>`, `<Flex>`, or `<Grid>` from `Layout.tsx`.
- **Rationale**: Keeps the DOM flat, improves readability, and ensures consistent spacing logic.

### III. Declarative Over Imperative
Prefer component props over massive inline `className` strings.
- **Wrong**: `<GlassCard className="hover:bg-white/5 cursor-pointer rounded-none border-l-0">`
- **Right**: `<GlassCard interactive rounded="none" border="subtle">`
- **Rationale**: Centralizes logic in the component library. If we want to change how "interactive" looks, we change it in one file, not 50.

### IV. Flat DOM Hierarchy
If a component can be styled using a single wrapper, do not add inner wrappers.
- **Wrong**: `<Section><div className="max-w-4xl mx-auto"><Grid>...</Grid></div></Section>`
- **Right**: `<Section size="md"><Grid>...</Grid></Section>`

---

## 2. Core Library Usage

### Layout (`Layout.tsx`)
- **`Section`**: The primary vertical block. Use `size="lg"` for standard pages, `size="xl"` for wide feature grids.
- **`Grid`**: For multi-column layouts. Use the `divide` prop (`"x"`, `"y"`, `"md:x"`) instead of manual border classes.
- **`Stack`**: For vertical spacing. Use the `divider` prop for automatic themed separators.

### Cards (`GlassCard.tsx`, `MarketingCard.tsx`)
- **`GlassCard`**: The base container. Always use `interactive` prop for hoverable items.
- **`MarketingCard`**: The unified component for Features, Social Links, and Download Cells. **Do not create new "SocialCard" or "FeatureItem" components.** Use this instead.

### Dialogs (`Dialog.tsx`)
- **`Dialog`**: The universal dialog component. Supports `title`, `description`, `icon`, and `children` for content.
- **`actions` prop**: Pass an array of `DialogAction` objects for declarative button footers:
  ```tsx
  actions={[
    { label: "Cancel", variant: "secondary", onClick: handleCancel },
    { label: "Delete", icon: <LuTrash2 />, variant: "destructive", onClick: handleDelete },
    { label: "Save", icon: <LuSave />, variant: "primary", onClick: handleSave },
  ]}
  ```
- **`footer` prop**: Escape hatch for fully custom footer content (e.g. copyright text). Mutually exclusive with `actions`.
- **Do not** build one-off modal markup. Always use `<Dialog>`.

### Buttons (`Button.tsx`)
- Variants: `primary`, `secondary`, `ghost`, `destructive`.
- **`destructive`**: Looks like secondary at rest, turns red on hover. Use for discard/delete actions.

### Typography (`Typography.tsx`)
- Use `<Subtle>` for metadata or secondary descriptions.
- Use `<Caption>` for small, uppercase labels. Supports `variant="muted"` for secondary/non-accent captions.

### Links (`ActionLink.tsx`)
- Use `<ActionLink>` for styled interactive text links. Supports `variant="primary"` (accent color) and `variant="meta"` (small uppercase).
- **Reuse for CTA labels** inside cards rather than inline `<span>` styling.

### Utility (`Spacer.tsx`)
- Use `<Spacer width={N} height={N} />` for layout spacers instead of empty `<div>` elements. Values use Tailwind's spacing scale (1 = 0.25rem).

### Semantic CSS Classes (`globals.css`)
When a visual pattern is reused or a `className` exceeds 50 characters, extract it to a base class.

**Semantic text colors** — always use tokens, never raw Tailwind grays:
| Token | Usage |
|---|---|
| `text-theme-text` | Primary text (replaces `text-gray-100`, `text-white` for body text) |
| `text-theme-text-secondary` | Secondary/lead text (replaces `text-gray-300`) |
| `text-theme-text-muted` | Muted/subtle text (replaces `text-gray-400`) |

**Editor surface tokens** — for dialogs, panels, and editor chrome:
| Token | Usage |
|---|---|
| `bg-editor-surface` | Dialog/panel background (`#252526`) |
| `bg-editor-surface-raised` | Elevated surfaces like dialog headers/footers (`#2a2d2e`) |

**Mockup classes** — used by `EditorMockup.tsx`:
| Class | Purpose |
|---|---|
| `.mockup-frame` | Outer frame sizing and shadow |
| `.mockup-titlebar` | Window title bar chrome |
| `.mockup-pane` | Shared pane padding/sizing |
| `.mockup-code` | Code/editor pane specifics (mono font, border, opacity) |
| `.mockup-preview` | Preview pane specifics (backdrop, bg only — `prose` classes stay inline) |

**Tailwind v4 `@apply` caveat**: Plugin classes like `prose`, `prose-invert` etc. cannot be used with `@apply`. Keep them as inline utility classes on the element.

---

## 3. Review Checklist for New Code
- [ ] Are all colors using theme tokens (`text-theme-text`, `text-theme-text-secondary`, `text-theme-text-muted`, `text-theme-primary`, `text-theme-accent`)?
- [ ] Is there any `className` string longer than 50 characters? (If so, move styles into the component, a variant, or a base CSS class).
- [ ] Are we using `<Stack>`, `<Flex>`, or `<Grid>` for all positioning?
- [ ] Are we using `<Spacer>` instead of empty styled `<div>` spacers?
- [ ] Is the code reusing `MarketingCard` for marketing content?
- [ ] Are styled text links using `<ActionLink>` instead of inline `<span>` or `<a>` styling?
- [ ] Are small labels using `<Caption>` or `<Subtle>` instead of inline typography classes?
- [ ] Are we avoiding manual `rounded-XX` classes unless overriding a specific edge case?
- [ ] Are all dialogs using `<Dialog>` with `actions` prop instead of hand-rolled modals?
- [ ] Is the `destructive` button variant used for discard/delete actions (not custom red hover classes)?
