[← Back to Index](../INDEX.md)

# KULTI — Design Decisions & Visual Identity

This document outlines the KULTI visual system, serving as its single source of truth. It defines the visual language, typography, color palette, and front-end implementation rules.

## 1. Aesthetic Concept
KULTI is designed to feel like a physical, curated cultural space. We prioritize warmth, tactility, and high legibility. The interface acts as a **curated backdrop** (the gallery walls) that allows the content (art pieces, maps, and user reviews) to remain the focal point.

Guiding principles:
* Calm, minimal, and editorial (never loud or playful)
* Content-first hierarchy
* Spacious layouts with intentional whitespace
* Avoid generic SaaS or “tech startup” aesthetics

## 2. Design Tokens (Technical Reference)
Developers and AI agents must use these constants to ensure visual consistency.

### Color Palette
Our palette is inspired by traditional Celadon ceramics resting on natural wood against neutral, modern gallery walls.

| Token Name | Hex Code | Usage | Rationale |
| :--- | :--- | :--- | :--- |
| `COLOR_BG_GALLERY` | `#F5F4F0` | Main Background | Mimics museum walls; reduces eye strain |
| `COLOR_SURFACE_WHITE` | `#FFFFFF` | Cards, Modals, Panels | Creates elevation and focus |
| `COLOR_PRIMARY_SAGE` | `#8BA390` | CTA, Active States, Pins | Sophisticated organic celadon green; non-aggressive |
| `COLOR_PRIMARY_GLAZE` | `#A3BDB1` | Hover / Interaction | Lighter celadon tint for interactive feedback |
| `COLOR_TEXT_OBSIDIAN` | `#1A1B1A` | Headings, Body | Softer than pure black; high legibility |
| `COLOR_TEXT_CHARCOAL` | `#4A4A4A` | Secondary Text | De-emphasized metadata |
| `COLOR_ACCENT_WALNUT` | `#6B533E` | Badges, Stamps, Icons, Highlights | Warm, tactile accent |
| `COLOR_BORDER_BIRCH` | `#D9D7D2` | Borders, Dividers | Structural clarity without noise |

### Typography
We use a dual-font system to balance artistic elegance with modern usability.

| Application | Font Family | Style | Usage Rules |
| :--- | :--- | :--- | :--- |
| **Display / Headings** | `Cormorant Garamond` | Serif | H1, H2, museum names, section titles |
| **Main UI / Body** | `Public Sans` | Sans-Serif | Navigation, inputs, labels, reviews |

## 3. UI Styling & Effects
To maintain the "tactile" feel of the project, follow these CSS standards:

* **Elevation:** Use soft, Walnut-tinted shadows to simulate depth.
    * *Standard Shadow:* `box-shadow: 0 4px 12px rgba(107, 83, 62, 0.08);`
* **Borders:** Keep lines thin (`1px`) and use `COLOR_BORDER_BIRCH`. Prefer borders over heavy shadows
* **Corners:** Use a standard `border-radius: 8px` for cards and buttons. Avoid sharp 0px corners (too clinical / harsh) or 50px pill shapes (too "tech-startup" / generic).
* **Spacing:** Generous padding and margins. Avoid dense layouts.

## 4. Front-End Implementation Strategy
* **CSS Framework: Tailwind CSS**
  * *Why:* Allows rapid styling using utility classes that we will map directly to the color hex codes above.
* **Component Library: Shadcn/UI**
  * *Why:* Unstyled, accessible components that we can completely customize to fit our Celadon theme without fighting pre-existing styles.
* **Icons: Lucide React**
  * *Why:* Clean, consistent stroke weights that look great alongside Public Sans.

## 6. Design Acceptance Criteria
For a front-end Pull Request to be approved, it must:
1. Use only defined color tokens (via Tailwind config).
2. Apply typography correctly (serif vs sans separation)
3. Follow spacing and layout principles (no dense UI)
4. Use proper interaction patterns (dropdowns, overlays, dismissals)
5. Maintain accessibility (contrast, readability)
6. Avoid introducing generic UI patterns that break the curated aesthetic

## 7. Anti-Patterns (DO NOT IMPLEMENT)
- Bright, saturated colors
- Heavy shadows or neumorphism
- Pill-heavy or overly rounded UI
- Gamified elements (badges, streaks, flashy ratings)
- Social media-style feeds
