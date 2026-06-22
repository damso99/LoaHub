---
name: LoaHub
colors:
  surface: '#10131a'
  surface-dim: '#10131a'
  surface-bright: '#363940'
  surface-container-lowest: '#0b0e14'
  surface-container-low: '#191c22'
  surface-container: '#1d2026'
  surface-container-high: '#272a31'
  surface-container-highest: '#32353c'
  on-surface: '#e1e2eb'
  on-surface-variant: '#b9cacb'
  inverse-surface: '#e1e2eb'
  inverse-on-surface: '#2e3037'
  outline: '#849495'
  outline-variant: '#3b494b'
  surface-tint: '#00dbe9'
  primary: '#dbfcff'
  on-primary: '#00363a'
  primary-container: '#00f0ff'
  on-primary-container: '#006970'
  inverse-primary: '#006970'
  secondary: '#d1bcff'
  on-secondary: '#3c0090'
  secondary-container: '#7000ff'
  on-secondary-container: '#ddcdff'
  tertiary: '#fff3f4'
  on-tertiary: '#66002c'
  tertiary-container: '#ffccd6'
  on-tertiary-container: '#bb0058'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#7df4ff'
  primary-fixed-dim: '#00dbe9'
  on-primary-fixed: '#002022'
  on-primary-fixed-variant: '#004f54'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#d1bcff'
  on-secondary-fixed: '#23005b'
  on-secondary-fixed-variant: '#5700c9'
  tertiary-fixed: '#ffd9e0'
  tertiary-fixed-dim: '#ffb1c3'
  on-tertiary-fixed: '#3f0019'
  on-tertiary-fixed-variant: '#8f0041'
  background: '#10131a'
  on-background: '#e1e2eb'
  surface-variant: '#32353c'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  gutter: 20px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style

The design system is engineered for a high-performance gaming utility and community hub, specifically tailored for the *Lost Ark* ecosystem. The brand personality is technical, authoritative, and immersive, evoking the feeling of a sophisticated command center. It targets power users who value data density, speed, and a sleek, "gamer-centric" aesthetic without falling into over-the-top tropes.

The visual style is a fusion of **Minimalism** and **Glassmorphism**, set against a deep, atmospheric backdrop. It utilizes high-contrast neon accents to highlight critical interactive elements and data points. The interface relies on translucency and background blurs to maintain a sense of depth while ensuring that complex data tables and character stats remain legible and organized.

## Colors

The palette is rooted in a "Dark Navy Neon" aesthetic. The core foundation is a deep, desaturated navy-black, which provides a low-strain environment for long gaming sessions.

- **Primary (Electric Cyan):** Used for primary actions, active states, and critical success indicators.
- **Secondary (Neon Purple):** Used for leveling progress, rare item grades, and secondary accents.
- **Tertiary (Cyber Pink):** Reserved for alerts, high-priority notifications, or specific character classes.
- **Neutral:** A range of cool grays and deep navies used for surfaces, borders, and text hierarchy.

Surface backgrounds use a slight blue tint (#121721) to prevent the "true black" smearing effect on OLED screens and to maintain the navy theme.

## Typography

This design system uses **Inter** as the primary typeface due to its exceptional support for both Latin characters and Hangul (Korean). Inter provides a neutral, systematic feel that handles the dense information architecture of a gaming hub with ease. 

For technical data, item levels, and numerical stats, **JetBrains Mono** is employed to provide a "code-like" precision. 

**Korean Typography Guidelines:**
- Maintain a minimum line-height of 1.5x for body text in Korean to ensure the complex strokes of Hangul are legible.
- Use the "Medium" (500) weight for sub-headers in Korean, as "Regular" (400) can occasionally appear too light against dark backgrounds.

## Layout & Spacing

The design system utilizes a **Fluid Grid** system optimized for data-heavy dashboards. The layout is built on a 4px baseline grid to ensure mathematical harmony between icons, text, and containers.

- **Desktop:** 12-column grid with 20px gutters. Content is often organized into "Modules" that span 3, 4, or 6 columns.
- **Tablet:** 8-column grid with 16px gutters.
- **Mobile:** 4-column grid with 16px margins. 

The spacing philosophy emphasizes "Data over Whitespace." While margins are generous on the outer edges of the screen to create a premium feel, internal component spacing is tight (8px to 12px) to minimize scrolling during gameplay-related information lookups.

## Elevation & Depth

Depth is communicated through **Glassmorphism** and **Tonal Layering**. Instead of traditional drop shadows, this design system uses:

1.  **Z-Index 0 (Deep):** The base navy background (#0B0E14).
2.  **Z-Index 1 (Surface):** Slightly lighter navy (#161B26) with a subtle 1px border (#2D3545).
3.  **Z-Index 2 (Overlay):** Translucent layers (Alpha 60%) with a `backdrop-filter: blur(12px)`. These are used for modals and dropdowns.
4.  **Glow States:** Interactive elements do not use shadows; they use an "Outer Glow." For example, a focused button emits a soft 8px blur of the Primary Cyan color at 30% opacity.

## Shapes

The shape language is "Technical-Sharp." A **Soft (0.25rem)** roundedness is applied to standard components like buttons and input fields to keep them approachable but professional. 

- Large containers (Cards) use `rounded-lg` (0.5rem).
- Interactive status pips and small item tags use `rounded-full` (Pill-shaped) to distinguish them from structural elements.
- Geometric accents (like angled corners on headers) can be used to reinforce the "HUD" (Heads-Up Display) aesthetic.

## Components

### Buttons
- **Primary:** Solid Cyan background with black text. On hover, apply a Cyan outer glow.
- **Secondary:** Transparent with a 1px Cyan border. On hover, fill with 10% Cyan opacity.
- **Ghost:** No border, Cyan text. Used for low-priority utility actions.

### Input Fields
- Dark backgrounds (#0B0E14) with a subtle 1px border (#2D3545). 
- Active state: Border changes to Primary Cyan with a 2px inner "glow" line.

### Cards & Modules
- Backgrounds use the Z-Index 1 surface color. 
- Headers within cards should have a subtle bottom divider (#2D3545) or a contrasting background color (#1C2331).

### Item Tooltips
- High-blur glassmorphic background. 
- Tier-based borders (e.g., Orange for Legendary, Purple for Epic) using the secondary/tertiary colors to immediately communicate value.

### Chips & Badges
- Used for character classes or status effects. 
- Small, uppercase JetBrains Mono text with 120% line height.