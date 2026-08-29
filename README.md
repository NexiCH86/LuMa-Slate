# LuMa Slate

LuMa Slate is a portrait-first E-Ink engineering workspace for the ONYX BOOX Tab Ultra C Pro.

## Target device

- BOOX Tab Ultra C Pro
- 10.3-inch Kaleido 3
- Portrait use only
- B/W resolution: 2480 × 1860 at 300 ppi
- Color resolution: 1240 × 930 at 150 ppi
- Android 12

## Current prototype – V0.6

### Block 01 – Workspace shell & dashboard

- LuMa Slate Home dashboard
- Portrait-only layout
- E-Ink friendly contrast and restrained color use
- Large touch targets
- Bottom navigation
- Offline cache via Service Worker
- Web App Manifest configured for portrait mode

### Block 02 – LuMa Library

- Searchable document list
- Recent, favorites and offline filters
- Categories for standards, technical books, manuals and courses
- Reading-progress indicators
- LuMa Sync status area

### Block 03 – LuMa Reader

- Library-to-Reader document flow
- Document title, page counter and page navigation
- E-Ink-oriented paper view
- Pen, marker, bookmark and focus controls
- Document context handoff to LuMa AI

### Block 04 – LuMa Work

- Project overview and project selection
- Progress and task counters
- Next-actions checklist
- Active project detail area
- Project context handoff to LuMa AI

### Block 05 – LuMa Notes + AI workspace

- Note list and note editor
- Pen / marker / eraser / selection toolbar concept
- New-note workflow
- LuMa AI modes: Online, Local and Offline
- Context switching between workspace, document, project and notes
- Connected UI flow from Reader, Work and Notes into LuMa AI

### Block 06 – LuMa Update Core

- Independent UI and Android-shell versioning
- `update-manifest.json` stable release channel
- Automatic update check at app startup
- Compatibility check using `minimumShellVersion`
- E-Ink friendly in-app update banner
- Service Worker cache migration between UI versions
- User data is architecturally separated from UI releases
- Goal: install the APK once and deliver ordinary LuMa Slate releases OTA

See `docs/UPDATE-ARCHITECTURE.md` for the complete update model.

## Update model

The future Android APK will be a long-lived native shell. Normal LuMa Slate development happens in the independently updateable UI layer. Library, Reader, Work, Notes, AI workflows and most design/function changes are intended to update without reinstalling the APK.

A new APK can still be required when the native Android/BOOX bridge itself must change, for example new Android permissions, device APIs, signing/SDK requirements or new native BOOX integrations. The update architecture deliberately keeps that native layer small so these APK updates should be rare.

## Run locally

Any static web server works. Example:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Architecture direction

The prototype deliberately stays framework-free while we validate it on the real BOOX hardware. The current V0.6 is an interactive UI prototype with the first OTA-update architecture in place. Document contents, projects, notes and AI answers are still demo data. The next engineering phase connects these screens to local Android storage, BOOX capabilities, LuMa Sync and the LuMa AI backend.

## Next phases

1. Deploy V0.6 and test it on the physical BOOX Tab Ultra C Pro.
2. Tune scale, font weight, touch targets, ghosting and refresh behaviour.
3. Build the long-lived Android shell around the OTA update architecture.
4. Connect the Library to real local files and LuMa Sync.
5. Implement real PDF rendering and the BOOX/Android annotation bridge.
6. Connect LuMa AI online/local/offline backends.
7. Add device integration and optional default-launcher behaviour.

## Design principles

- Portrait is the canonical layout.
- Minimise animations and translucent effects.
- Use black/white contrast for information; color only as an accent.
- Avoid dense small controls.
- Preserve BOOX/Android underneath; LuMa Slate is an app/workspace layer, not a custom ROM.
