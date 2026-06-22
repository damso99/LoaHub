---
name: LostOverflow
colors:
  surface: '#0e1320'
  surface-dim: '#0e1320'
  surface-bright: '#343947'
  surface-container-lowest: '#090e1b'
  surface-container-low: '#161b29'
  surface-container: '#1a1f2d'
  surface-container-high: '#252a38'
  surface-container-highest: '#303443'
  on-surface: '#dee2f5'
  on-surface-variant: '#c1c7d2'
  inverse-surface: '#dee2f5'
  inverse-on-surface: '#2b303e'
  outline: '#8b919b'
  outline-variant: '#414750'
  surface-tint: '#a0c9ff'
  primary: '#b2d2ff'
  on-primary: '#00325a'
  primary-container: '#7cb8ff'
  on-primary-container: '#00487e'
  inverse-primary: '#1461a2'
  secondary: '#aec6ff'
  on-secondary: '#002e6a'
  secondary-container: '#0061d1'
  on-secondary-container: '#dbe4ff'
  tertiary: '#ffc847'
  on-tertiary: '#402d00'
  tertiary-container: '#e5ab00'
  on-tertiary-container: '#5b4200'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d2e4ff'
  primary-fixed-dim: '#a0c9ff'
  on-primary-fixed: '#001c37'
  on-primary-fixed-variant: '#00497f'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#aec6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#ffdf9f'
  tertiary-fixed-dim: '#f9bd22'
  on-tertiary-fixed: '#261a00'
  on-tertiary-fixed-variant: '#5c4300'
  background: '#0e1320'
  on-background: '#dee2f5'
  surface-variant: '#303443'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.3'
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container_max_width: 1440px
  mobile_min_width: 360px
  gutter: 24px
  margin_desktop: 40px
  margin_mobile: 16px
  stack_sm: 8px
  stack_md: 16px
  stack_lg: 24px
---

## Brand & Style
The design system is engineered for a high-end gaming community, blending the precision of modern e-sports platforms with the ethereal fantasy aesthetic of MMORPGs. The brand personality is authoritative yet welcoming, designed to evoke a sense of "elite coordination" and "legendary progression."

The visual style leans into **Modern Corporate/Gaming**, utilizing deep-space navy surfaces, neon-infused accents, and subtle glassmorphism to create a high-fidelity dashboard experience. It prioritizes data density and legibility for complex raid schedules and character builds while maintaining a premium, immersive atmosphere through soft glows and meticulous border treatments.

## Colors
The palette is rooted in a dark, multi-layered navy environment to reduce eye strain during long gaming sessions. 

- **Primary & Secondary Blues:** These represent the "Neon" energy of the UI. Use the Primary Accent (#7CB8FF) for interactive icons and text highlights, and the Active Blue (#4C8DFF) for filled states and primary actions.
- **Gold Highlight:** Reserved strictly for high-value information such as rewards, legendary drops, or premium achievements.
- **Surface Logic:** Background (#101522) is the base. Surface (#1A2233) is used for cards. Surface Hover (#212C42) provides immediate tactile feedback.
- **Status Badges:** Use dedicated semantic colors for Raid/Class (Blue), Recruiting (Green), and Closed (Red) to ensure instant cognitive recognition.

## Typography
The system uses **Inter** for its exceptional legibility in data-heavy environments and **Geist** for labels and technical data to provide a sharp, developer-adjacent precision.

- **Headlines:** Should be bold and concise. Larger displays use tighter letter spacing to maintain a "heavy" gaming feel.
- **Body:** Designed with a generous line height (1.6) to ensure that long-form raid guides or class descriptions remain readable.
- **Labels:** Monospaced-leaning Geist is used for stats, item levels, and timestamps to emphasize the technical nature of MMORPG optimization.

## Layout & Spacing
This design system employs a **12-column fluid grid** for desktop, constrained to a maximum width of 1440px to prevent information dispersal on ultra-wide monitors. 

- **Desktop:** 24px gutters with 40px outer margins. Content should be organized into modular cards that can span 3, 4, 6, or 12 columns.
- **Mobile:** The grid collapses to a single column with 16px margins.
- **Rhythm:** Use an 8px base scaling system. Consistent vertical stacking (8/16/24) ensures a structured, dashboard-like feel. 
- **Layout Model:** A fixed left-hand sidebar for navigation is recommended for the dashboard, with a fluid content area that holds cards.

## Elevation & Depth
Depth is created through **Tonal Layering** and **Glassmorphism** rather than traditional heavy shadows.

- **Planes:** The base background is the furthest plane. Cards sit on top with a subtle 1px border `rgba(255,255,255,0.05)`.
- **Blur:** Overlays, dropdowns, and modals use a `backdrop-filter: blur(12px)` to maintain context while isolating the user's focus.
- **Glows:** Primary interactive elements (active buttons, level-up indicators) should feature a soft outer glow using the Primary Accent color with 40% opacity and a 15px-20px blur radius.
- **Shadows:** Use a single, very soft, large-spread shadow for cards to lift them slightly: `0 10px 30px rgba(0,0,0,0.5)`.

## Shapes
The shape language balances modern approachability with structured gaming UI. 

- **Cards & Containers:** Use a consistent 12px (`rounded-lg`) to 16px (`rounded-xl`) radius to soften the technical layout.
- **Interactive Elements:** Buttons and Category Tabs use a **Pill-shape** (fully rounded) to differentiate them from the structural containers.
- **Inputs:** Use `rounded-lg` (8px) for a more professional, grounded feel.

## Components
### Buttons & Tabs
- **Primary Button:** Pill-shaped, gradient fill (Primary to Secondary Blue), with a subtle neon glow on hover. Text is white/bold.
- **Tabs:** Pill-shaped with a dark transparent background. Active state uses a gradient border or glow.
- **Ghost Buttons:** 1px border of Primary Accent, transparent center, becoming solid on hover.

### Cards
- **Structure:** 16px padding, 1px subtle white-translucent border, `surface` color background. 
- **Hover State:** Transition to `surface_hover` and increase border opacity to `0.1`.

### Status Badges
- **Format:** Small, uppercase label-sm typography, pill-shaped.
- **Raid/Class:** Blue background, white text.
- **Recruiting:** Green background, dark text or high-contrast white.
- **Closed:** Red background, white text.
- **Rewards:** Gold background, dark text, with a slight "sparkle" or radial gradient highlight.

### Input Fields
- Darker than the card background, subtle 1px border. Focus state triggers a Primary Blue border and a very faint inner glow.

### Progress Bars
- Background: `#212C42`. Fill: Gradient of Primary Blue. For "Gold" milestones, the fill should transition to the Gold palette.