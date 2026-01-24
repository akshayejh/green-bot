# Green Bot - AI Agent Instructions

This document provides guidelines for AI assistants working on the Green Bot codebase.

---

## 📋 Changelog Management

### After Every Notable Change
- Add new features, fixes, or changes to `CHANGELOG.md` under `## [Unreleased]`
- Use the appropriate category: `### Added`, `### Changed`, `### Fixed`, `### Removed`
- Write user-facing descriptions (not technical implementation details)
- Keep entries concise but descriptive

### When Reverting Changes
- Remove the corresponding entry from the `[Unreleased]` section
- Do not leave orphaned changelog entries for reverted work

### Changelog Format
```markdown
## [Unreleased]

### Added
- New feature description (user benefit)

### Changed
- What changed and why it matters to users

### Fixed
- Bug that was fixed (symptoms users experienced)

### Removed
- Feature or behavior that was removed
```

---

## 🧩 Component Guidelines

### Always Check Existing Components First
Before creating new UI elements, search these locations:
1. `src/components/ui/` - Base UI components (buttons, inputs, dialogs, etc.)
2. `src/components/` - App-level shared components
3. `src/features/*/components/` - Feature-specific components that might be reusable

### Make Components Reusable
When building UI, ask:
- Could this be used elsewhere in the app?
- Can I extract the core functionality into a generic component?
- Does a similar pattern already exist that I should extend?

### UI Kit Structure
The project maintains a growing UI kit in `src/components/ui/`. When adding components:

```
src/components/ui/
├── button.tsx          # Base primitives
├── dialog.tsx
├── input.tsx
├── ...
├── settings.tsx        # Barrel exports for settings kit
├── settings-card.tsx   # Settings-specific components
├── settings-item.tsx
├── nested-dialog.tsx   # Specialized dialog patterns
└── ...
```

### Component Patterns

**Barrel Exports**: Group related components with barrel files:
```tsx
// settings.tsx
export { SettingsCard } from "./settings-card";
export { SettingsItem } from "./settings-item";
// etc.
```

**Composable Props**: Design components with sensible defaults but allow customization:
```tsx
interface SettingsCardProps {
    icon?: LucideIcon;           // Optional icon
    title?: string;              // Optional title
    variant?: "default" | "muted" | "accent";  // Variants
    className?: string;          // Always allow className override
    children?: ReactNode;        // Composable children
}
```

**Documentation**: Add JSDoc comments for complex components:
```tsx
/**
 * A card component for settings sections.
 * 
 * @example
 * ```tsx
 * <SettingsCard icon={Palette} title="Appearance">
 *   <SettingsSwitchItem ... />
 * </SettingsCard>
 * ```
 */
```

---

## 🏗️ Project Architecture

### Directory Structure
```
src/
├── components/         # Shared UI components
│   ├── ui/            # Base UI kit (shadcn-style)
│   └── *.tsx          # App-level components
├── features/          # Feature modules (self-contained)
│   ├── settings/      # Each feature has its own folder
│   ├── files/
│   └── ...
├── hooks/             # Custom React hooks
├── store/             # Zustand state stores
├── lib/               # Utilities (cn, helpers)
└── styles/            # Global CSS
```

### Feature Module Pattern
Each feature should be self-contained:
```
features/settings/
├── settings-page.tsx       # Main view
├── general-settings.tsx    # Sub-views
├── update-settings.tsx
└── components/             # Feature-specific components (if needed)
```

### State Management
- Use Zustand stores in `src/store/`
- Persist user preferences with `zustand/middleware` persist
- Keep stores focused (one per domain: devices, settings, files, etc.)

---

## 🎨 Styling Conventions

### Tailwind CSS
- Use Tailwind utility classes
- Leverage the `cn()` helper from `@/lib/utils` for conditional classes
- Follow the existing color token system (primary, muted, accent, etc.)

### Design Tokens
The app uses CSS variables for theming. Prefer semantic tokens:
```tsx
// ✅ Good - uses semantic tokens
className="bg-muted text-muted-foreground"
className="border-primary/20 bg-primary/5"

// ❌ Avoid - hardcoded colors
className="bg-gray-100 text-gray-500"
```

### Spacing & Sizing
- Use consistent spacing: `gap-2`, `gap-3`, `gap-4`, `p-4`, `p-6`
- Icon sizes: `h-4 w-4` (small), `h-5 w-5` (medium), `h-6 w-6` (large)
- Border radius: `rounded-lg`, `rounded-xl` for cards

---

## 🔧 Code Patterns

### Imports
Use path aliases:
```tsx
import { Button } from "@/components/ui/button";
import { useDeviceStore } from "@/store/device-store";
import { cn } from "@/lib/utils";
```

### Icons
Use Lucide React icons:
```tsx
import { Settings, Folder, Terminal } from "lucide-react";
```

### Tauri Commands
```tsx
import { invoke } from "@tauri-apps/api/core";

const result = await invoke<string>("command_name", { param: value });
```

### Toast Notifications
```tsx
import { toast } from "sonner";

toast.success("Success message");
toast.error("Error message");
toast.info("Info message");
```

---

## ✅ Before Submitting Changes

1. **Check for errors**: Run `bun run build` or check for TypeScript errors
2. **Update changelog**: Add notable changes to `CHANGELOG.md`
3. **Verify reusability**: Could any new component be generalized?
4. **Follow patterns**: Match existing code style and conventions
5. **Test the UI**: Ensure changes work in both light and dark themes

---

## 🚫 Avoid

- Creating one-off components when a reusable pattern exists
- Hardcoding colors instead of using theme tokens
- Adding features without changelog entries
- Leaving unused imports or dead code
- Breaking existing component APIs without migration
