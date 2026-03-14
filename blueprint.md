# Omok (Gomoku) - Project Blueprint

## Project Overview
A modern, beautiful, and interactive implementation of the classic Omok (Five in a Row) game using framework-less web standards. This project focuses on high-quality visuals, responsive design, and smooth user experience.

## Detailed Project Outline

### Visual Design & Aesthetics
- **Board:** 15x15 grid with a rich, dark wood texture and subtle grain.
- **Pieces:** Glossy, high-contrast black and white stones with multi-layered drop shadows for a "lifted" look.
- **Typography:** Using expressive, modern sans-serif fonts for clear communication.
- **Interactivity:** Soft "glow" effects on buttons and interactive elements. Hover indicators for move placement.
- **Responsiveness:** Fluid layout that adapts seamlessly from desktop to mobile viewports.

### Features
- **Turn Management:** Automatic switching between Black and White players.
- **Win Detection:** Checks for five consecutive stones horizontally, vertically, and diagonally.
- **Game Controls:** "New Game" button to reset the board.
- **Feedback UI:** Clear messaging for the current turn and game outcomes (Win/Draw).

### Technical Stack
- **HTML5:** Semantic structure with custom containers for the board.
- **CSS3:** Grid/Flexbox for layout, custom properties for theming, and modern effects (oklch, :has(), container queries).
- **JavaScript (ES Modules):** Modular game logic for clean separation of concerns.

## Current Implementation Plan - COMPLETED

### 1. Structure (index.html) - DONE
- Main game container, header, board, and controls are implemented.

### 2. Styling (style.css) - DONE
- Modern visual design with wood texture, glossy stones, and responsive layout.
- Used oklch colors and SVG noise filter for high-quality aesthetics.

### 3. Logic (main.js) - DONE
- `OmokGame` class handles board state, move placement, and win detection.
- Win detection covers horizontal, vertical, and both diagonal directions.
- Restart functionality implemented.
- **NEW:** Move history tracking and UI updates (기보 기능).
- **NEW:** Toggleable move sequence numbers on stones (수순 표시).
- **NEW:** Partnership inquiry modal with Formspree integration.

## Verification & Testing
- [x] Gameplay: Stones can be placed on intersections.
- [x] Win Detection: Correctly identifies 5 in a row.
- [x] Move History: Correctly logs move sequence and coordinates.
- [x] Move Numbers: Toggle button correctly shows/hides numbers on stones.
- [x] Partnership Form: Modal opens/closes and points to the correct Formspree URL.
- [x] Responsive: Sidebar adapts to mobile view.


