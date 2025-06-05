# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build
```

## Architecture Overview

This is a React + TypeScript solar system physics simulation that renders in Canvas. The architecture is centered around:

**Core Physics Engine**: `simulationEngine.ts` handles gravitational force calculations, n-body interactions, collision detection/merging, and orbital mechanics using semi-implicit Euler integration.

**State Management**: The `useSimulation` hook orchestrates all simulation state including:
- Simulation parameters (gravity, sun mass)
- Time control (timeScale, isRunning) 
- View parameters (zoom, camera target)
- Planet/sun state management

**Modular Hooks**:
- `usePlanetTrails` - Manages orbital trail rendering and storage
- `usePrediction` - Calculates future orbital paths for trajectory visualization
- `useSimulation` - Main orchestration hook

**Component Architecture**: 
- `App.tsx` is the main entry point with canvas ref
- `ControlPanel.tsx` is split into focused sub-panels:
  - `TimeControlPanel` - Play/pause/speed controls
  - `SimulationParamsPanel` - Gravity and sun mass
  - `ViewControlPanel` - Zoom and camera targeting
  - `PlanetListPanel` - Planet management and selection
  - `PlanetEditor` - Add/edit individual planets

**Canvas Rendering**: `canvas/draw.ts` handles all visual rendering including planets with textures, orbital trails, predictions, and star fields. `canvas/textureLoader.ts` manages image loading for planet textures.

**Data Flow**: 
1. User interactions in components trigger callbacks
2. Callbacks update state via `useSimulation` 
3. State changes trigger re-renders and physics updates
4. Canvas redraws with new positions/trails

**Physics Features**:
- Realistic gravitational forces with softening parameters
- N-body interactions between all celestial bodies
- Collision detection with conservation of momentum/mass
- Orbital velocity calculations for stable orbits
- Variable time scaling and simulation control

**Key Files**:
- `types.ts` - Central type definitions for all celestial bodies and parameters
- `constants.ts` - Default values and simulation constants
- `simulationUtils.ts` - Utility functions for creating planets and sun
- `public/planets/` - Planet texture assets (earth.jpg, mars.jpg, etc.)

## Git Commit Messages
機能実装時のコミットメッセージは日本語で記述する：
