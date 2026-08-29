# LuMa Slate – Permanent Android Release Signing

Status: **mandatory for production Shell 1.0.1+**

## Policy

LuMa Slate production APKs are release-signed with one long-lived private Android signing identity.

- Never commit the keystore or passwords.
- Never replace the signing key for normal upgrades.
- Back up the `.jks` file and passwords in at least two secure locations.
- GitHub Actions must publish only release-signed APKs.
- Debug APKs are development-only and are not official LuMa Slate releases.

## One-time setup on Master Intel

From the LuMa-Slate repository in PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\create-release-keystore.ps1
```

The script creates:

- `local-signing/luma-slate-release.jks`
- `local-signing/LUMA_ANDROID_KEYSTORE_BASE64.txt`

`local-signing/` is ignored by Git.

## Required GitHub Actions secrets

Repository → Settings → Secrets and variables → Actions → New repository secret

1. `LUMA_ANDROID_KEYSTORE_BASE64`
   - complete contents of `local-signing/LUMA_ANDROID_KEYSTORE_BASE64.txt`
2. `LUMA_ANDROID_KEYSTORE_PASSWORD`
   - password used for the keystore
3. `LUMA_ANDROID_KEY_ALIAS`
   - `luma-slate-release`
4. `LUMA_ANDROID_KEY_PASSWORD`
   - password used for the private key

## Build rule

The GitHub workflow builds `:app:assembleRelease` only. It fails immediately when signing material is missing. The generated APK is verified with `apksigner` before upload.

Official artifact naming:

`LuMa-Slate-Shell-1.0.1-release.apk`

## Upgrade contract

Every future native Shell APK must be signed with the same permanent key. This preserves Android's upgrade trust chain so future Shell versions can install over the existing LuMa Slate app without uninstalling it.

## Recovery

If the permanent signing key is lost, Android will not accept a differently signed APK as an update to the installed app. Protect the key accordingly.
