# Design Concept: Neo-Retro StoryMode

## Vision
A high-energy, "Neo-Brutalist" interface that blends the raw, bold structure of modern web design (Framer-style bento grids) with the nostalgic, playful aesthetic of 8-bit gaming ("Bits" style).

## Core Pillars
1.  **Bold & Unapologetic**: High contrast, thick borders, and vibrant colors.
2.  **Pixel Perfect**: Typography and icons that pay homage to the 8-bit era.
3.  **Tactile & Responsive**: UI elements that feel "clickable" with hard shadows and press animations.

## Visual Language

### Typography
*   **Display / Headings**: `Press Start 2P` (Google Font)
    *   Used for: Main titles, stats, "Game Over" screens.
    *   Vibe: Arcade cabinet, digital readout.
*   **Body / UI**: `Space Grotesk` or `Inter` (Google Font)
    *   Used for: Descriptions, buttons, form inputs.
    *   Vibe: Clean, legible, but with a "tech" edge.

### Color Palette
*   **Primary Background**: `#F0F0F0` (Light Gray) or `#121212` (Dark Mode base).
*   **Surface (Cards)**: `#FFFFFF` (White) or `#1E1E1E` (Dark Mode surface).
*   **Borders & Text**: `#000000` (Pure Black).
*   **Brand Accent**: `#FF5C00` (Vibrant Orange) - *Reference to the "50%" image*.
*   **Secondary Accent**: `#00D1FF` (Cyan) or `#FF00E5` (Magenta) for "glitch" effects.

### UI Components (The "Bit" Style)

#### 1. The "Hard" Card
*   **Border**: `3px solid #000000`
*   **Shadow**: `6px 6px 0px 0px #000000` (Hard offset shadow)
*   **Radius**: `0px` (Sharp corners) or `4px` (Slightly rounded).
*   **Hover**: Shadow collapses to `2px 2px`, card moves down.

#### 2. The "Pixel" Button
*   **Font**: `Press Start 2P` (Small size)
*   **Background**: Brand Accent (`#FF5C00`)
*   **Border**: `3px solid #000000`
*   **Shadow**: `4px 4px 0px 0px #000000`
*   **Active**: `transform: translate(4px, 4px); box-shadow: none;`

#### 3. The "Bento" Grid
*   A layout of rectangular cards of varying sizes (1x1, 2x1, 2x2).
*   Gap: `24px`.
*   Used for: Game lists, stats, dashboard widgets.

## Implementation Strategy
1.  **Fonts**: Import `Press Start 2P` and `Space Grotesk` in `index.html`.
2.  **CSS Variables**: Define the palette and shadow utilities in `index.css`.
3.  **Components**: Refactor `Dashboard` and `CreateGame` to use the "Hard Card" and "Pixel Button" styles.
