# Narravo Design Principles and Guidelines

This document outlines the design principles used in Narravo, drawing from modern UI best practices to create a universal, lightweight, and professional design language. The core goal is to balance **functional efficiency** with **aesthetic quality**.

---

## 1. Core Philosophy

### 1.1 Clarity
*   **Clear Intent**: Every element should clearly communicate its function. If a button does not look like a button, it is a failure.
*   **Readability First**: Content is king. Spacing and typography must serve the reading experience.

### 1.2 Negative Space (Breathing Room)
*   **Avoid Clutter**: Use ample whitespace to distinguish functional areas instead of relying on heavy borders or dividers.
*   **Visual Focus**: Reduce the number of elements on screen so the user&apos;s eye can immediately find the most important action.

### 1.3 Feedback
*   **Real-time Response**: Every user interaction (click, hover, input) must have clear visual feedback.
*   **State Awareness**: Clearly distinguish between "Loading," "Success," "Error," and "Disabled" states.

### 1.4 Component-First
*   **No Reinventing the Wheel**: All UI elements must use the shared component library in `src/components/ui/`. Do not write one-off button, input, or card styles in page components.
*   **Consistency Through Reuse**: If a pattern appears in more than one place, it belongs in the component library.

---

## 2. Layout & Spacing

### 2.1 8pt Grid System
*   **Base Unit**: All spacing, heights, and widths should be multiples of `4px` or `8px`.
*   **Consistency**: Build the interface using a fixed scale of increments (e.g., 4, 8, 12, 16, 24, 32px) to create a visual rhythm.

### 2.2 Balance of Compactness
*   For tool-based extensions, the UI should be narrow and focused.
*   Core interaction areas (like the input field) should have the highest visual weight, while secondary functions should be minimized.

---

## 3. Visual Elements

### 3.1 Border Radius
*   **Nested Logic**: Outer container radius (e.g., a card) should be slightly larger than inner element radius (e.g., a button) to maintain harmonic nesting.
*   **Restraint**: Avoid excessively large radii that make the UI look unprofessional. Use the design token scale:
    *   Small elements (buttons/inputs): `var(--radius-sm)` (6px)
    *   Medium containers (cards/popups): `var(--radius-md)` (10px) - `var(--radius-lg)` (14px)
    *   Large surfaces (modals/onboarding): `var(--radius-xl)` (20px)
    *   Pills/badges: `var(--radius-pill)` (999px)

### 3.2 Shadows & Depth
*   **Natural Lighting**: Use multi-layered, soft shadows to mimic natural light, avoiding harsh, dark shadows.
*   **Hierarchy**: Use shadow depth to represent the Z-index level of floating elements.
*   **Token Reference**: Always use the shadow tokens (`--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl`) rather than custom shadow values.

### 3.3 Color System
*   **Adaptive (Dark/Light)**: Mandatory support for both Light and Dark modes via `prefers-color-scheme`.
*   **Zinc Neutral Palette**: The base neutral palette uses Zinc (50-950) instead of pure black and white. This adds depth and quality.
*   **Intent-based Colors**:
    *   `Accent` (Blue): Brand color for core actions and focus states.
    *   `Success` (Green): Positive completion.
    *   `Error` (Red): Errors or stopping.
    *   `Warning` (Amber): Cautionary information.
*   **Semantic Backgrounds**: Use `--bg-window`, `--bg-surface`, `--bg-elevated`, `--bg-sunken` for clear elevation hierarchy.

---

## 4. Typography

### 4.1 Font Stack
*   Prioritize system-native sans-serif fonts (`-apple-system`, `system-ui`, `Segoe UI`, etc.) for optimal rendering across all platforms.

### 4.2 Hierarchy
*   **Weight over Size**: Use font weights (Regular, Medium, Semi-bold, Bold) rather than just size to distinguish between headers and body text.
*   **Line Height**: Use a `1.5` line height for body text to ensure readability without fatigue.
*   **Letter Spacing**: Tighten letter spacing slightly for headings (`-0.02em` to `-0.01em`) to improve visual cohesion.

---

## 5. Component Specifications

### 5.1 Buttons
*   **Hit Targets**: Even if visually small, the actual hit target should not be smaller than `32x32px`.
*   **Variants**: Always use the appropriate `Button` variant:
    *   `primary` for main actions
    *   `secondary` for alternative actions
    *   `danger` for destructive actions
    *   `ghost` for icon buttons or low-emphasis actions
    *   `link` for text-only navigation
*   **Loading State**: Buttons that trigger async operations should use the `loading` prop instead of manually swapping text.

### 5.2 Input Controls
*   **Minimal Borders**: Use light borders by default; use Accent-colored borders with a subtle halo when focused.
*   **Placeholders**: Ensure placeholder text is distinct from actual content (low-contrast gray).
*   **Error States**: Inputs with errors show a red border and red focus ring. Use the `error` prop.
*   **Prefix/Suffix**: Use the `prefix` and `suffix` slots for icons or actions inside inputs (e.g., password visibility toggle).

### 5.3 Cards
*   **Elevation**: Use `elevation` prop to indicate hierarchy:
    *   `none` for nested sections within a card
    *   `low` for grouped content inside a page
    *   `medium` for primary content containers
    *   `high` for modals and floating panels

---

## 6. Iconography

*   **SVG Only**: All icons must be inline SVG. Never use emoji or image-based icons in the UI.
*   **Linear Style**: Prefer linear icons with 2px stroke weights.
*   **Consistency**: All icons within the same interface must share the same corner radius and stroke weight.
*   **Visual Balance**: Icons should be visually centered rather than strictly geometrically centered.
*   **Centralized**: Add new icons to `src/components/ui/Icon.tsx` rather than inlining them in components.

---

## 7. Motion Guidelines

*   **Lightweight First**: Animations should not exceed `200ms` for micro-interactions; page transitions may use up to `350ms`.
*   **Natural Curves**: Use `ease-in-out` or `cubic-bezier` curves, avoiding linear, mechanical movements.
*   **Intent-driven**: Animations should guide attention or provide feedback, never just for decoration.

---

## 8. Dark Mode Consistency

*   **Single Source of Truth**: All color values must come from `src/styles/theme.css` CSS variables.
*   **No Hardcoded Colors**: Never hardcode hex colors in component styles. Always reference a CSS variable.
*   **MiniWindow Exception**: Content script styles injected as strings should reference the same variable names with fallbacks, matching the values in `theme.css`.
