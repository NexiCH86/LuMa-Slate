#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PROJECT="$ROOT/ios/LuMaSlate.xcodeproj"
SCHEME="LuMaSlate"
BUILD_DIR="$ROOT/build/local-ipados"

if ! command -v xcodebuild >/dev/null 2>&1; then
  echo "Xcode command line tools are required."
  exit 1
fi

TEAM_ID="${LUMA_APPLE_TEAM_ID:-}"
if [[ -z "$TEAM_ID" ]]; then
  TEAM_ID="$(security find-identity -v -p codesigning 2>/dev/null | sed -nE 's/.*Apple Development:.*\(([A-Z0-9]{10})\).*/\1/p' | head -n1 || true)"
fi

if [[ -z "$TEAM_ID" ]]; then
  echo "No Apple Development signing identity found."
  echo "Open Xcode > Settings > Accounts, sign in with your Apple ID, then run this script again."
  echo "You can also set LUMA_APPLE_TEAM_ID manually."
  exit 2
fi

DEVICE_ID="${LUMA_IPAD_UDID:-}"
if [[ -z "$DEVICE_ID" ]]; then
  DEVICE_ID="$(xcrun devicectl list devices 2>/dev/null | awk '/iPad/ && /available/ {print $NF; exit}' || true)"
fi

if [[ -z "$DEVICE_ID" ]]; then
  echo "No available iPad detected. Connect the iPad by USB, unlock it and trust this Mac."
  echo "Alternatively set LUMA_IPAD_UDID manually."
  exit 3
fi

rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

echo "Building LuMa Slate for iPad"
echo "Apple Team: $TEAM_ID"
echo "Device:     $DEVICE_ID"

xcodebuild \
  -project "$PROJECT" \
  -scheme "$SCHEME" \
  -configuration Release \
  -sdk iphoneos \
  -destination "id=$DEVICE_ID" \
  -allowProvisioningUpdates \
  DEVELOPMENT_TEAM="$TEAM_ID" \
  CODE_SIGN_STYLE=Automatic \
  CONFIGURATION_BUILD_DIR="$BUILD_DIR" \
  clean build

APP_PATH="$BUILD_DIR/LuMa Slate.app"
if [[ ! -d "$APP_PATH" ]]; then
  echo "Signed app was not produced at: $APP_PATH"
  exit 4
fi

echo "Installing LuMa Slate on the connected iPad..."
xcrun devicectl device install app --device "$DEVICE_ID" "$APP_PATH"

echo "LuMa Slate installation completed."
