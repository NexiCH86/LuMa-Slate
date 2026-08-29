# LuMa Slate Update Architecture

## Goal

Install the Android APK once and deliver normal LuMa Slate UI releases over the air without reinstalling the APK.

## Layer model

### 1. Android Shell
The native APK contains only the long-lived device bridge: WebView/app shell, secure local storage, file permissions, BOOX integration, update bootstrap and native APIs.

### 2. LuMa Slate UI
The workspace UI is versioned independently and can be updated from the configured release endpoint. Normal releases should happen here.

### 3. User Data
Documents, note metadata, settings, project state and AI memory are stored separately from the UI package so UI updates never overwrite user data.

## Update flow

1. LuMa Slate starts.
2. The installed UI checks `update-manifest.json` with cache disabled.
3. If a newer compatible stable UI exists, LuMa Slate displays an E-Ink-friendly update banner.
4. The user starts the update.
5. The latest UI assets are downloaded and cached.
6. LuMa Slate reloads into the new UI version.
7. User data remains untouched.

## Compatibility guard

`minimumShellVersion` defines the oldest Android shell that can run the published UI. If a future UI requires new native capabilities, the updater must not install it on an older shell.

That is the only class of change that can require a new APK: changes to native Android/BOOX code, permissions, SDK requirements, signing or device APIs. Ordinary UI, workflow, Library, Reader, Work, Notes and AI changes are expected to ship without APK reinstallations.

## Channels

- `stable`: default channel for the BOOX device.
- Future option: `beta` for test builds before promotion to stable.

## Safety rules

- Never delete user data during UI updates.
- Keep the previous cached UI until the new version is ready.
- Verify compatibility before activation.
- Allow a manual update check.
- Keep update controls simple and static to reduce E-Ink refresh activity.
