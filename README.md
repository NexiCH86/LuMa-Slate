# LuMa Slate

LuMa Slate is a portrait-first E-Ink engineering workspace for the ONYX BOOX Tab Ultra C Pro.

## Target device

- BOOX Tab Ultra C Pro
- 10.3-inch Kaleido 3
- Portrait use only
- B/W resolution: 2480 × 1860 at 300 ppi
- Color resolution: 1240 × 930 at 150 ppi
- Android 12

## Current prototype – V0.2

### Block 01 – Workspace shell & dashboard

- LuMa Slate Home dashboard
- Portrait-only layout
- E-Ink friendly contrast and restrained color use
- Large touch targets
- Work, LuMa AI and Notes screens
- Bottom navigation
- Offline cache via Service Worker
- Web App Manifest configured for portrait mode

### Block 02 – LuMa Library

- Dedicated Library workspace
- Searchable document list
- Tabs for all, recent, favorites and offline documents
- Category filtering for standards, technical books, manuals and courses
- Reading-progress indicators
- Offline / cloud status mock data
- LuMa Sync status area
- Touch-first controls suitable for E-Ink

## Run locally

Any static web server works. Example:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Architecture direction

The first prototypes deliberately have no framework dependency. This gives us a fast, stable BOOX prototype and lets us validate E-Ink behaviour before we lock in the Android packaging architecture.

Next phases:

1. Test on real BOOX hardware.
2. Tune scale, font weight, refresh behaviour and color accents.
3. Connect Library to real local files and LuMa Sync.
4. Build Reader / annotation bridge.
5. Connect LuMa AI.
6. Package as Android shell / APK and optionally promote LuMa Slate to the default launcher.

## Design principles

- Portrait is the canonical layout.
- Minimise animations and translucent effects.
- Use black/white contrast for information; color only as an accent.
- Avoid dense small controls.
- Preserve BOOX/Android underneath; LuMa Slate is an app/workspace layer, not a custom ROM.
