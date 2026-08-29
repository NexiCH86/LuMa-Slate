param(
    [string]$OutputDir = "$PSScriptRoot\..\local-signing",
    [string]$Alias = "luma-slate-release"
)

$ErrorActionPreference = "Stop"

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
$Keystore = Join-Path $OutputDir "luma-slate-release.jks"

if (Test-Path $Keystore) {
    throw "Keystore already exists: $Keystore`nRefusing to overwrite the permanent LuMa Slate signing identity."
}

Write-Host "LuMa Slate permanent Android signing identity"
Write-Host ""
Write-Host "This key signs every future production APK. Keep the .jks and passwords permanently backed up."
Write-Host "The script will now ask for a strong keystore/key password."
Write-Host ""

& keytool -genkeypair `
    -v `
    -keystore $Keystore `
    -alias $Alias `
    -keyalg RSA `
    -keysize 4096 `
    -validity 10000 `
    -dname "CN=LuMa Labs, OU=LuMa Slate, O=LuMa Labs, L=Birr, ST=Aargau, C=CH"

if ($LASTEXITCODE -ne 0) {
    throw "keytool failed with exit code $LASTEXITCODE"
}

$Bytes = [IO.File]::ReadAllBytes($Keystore)
$Base64 = [Convert]::ToBase64String($Bytes)
$Base64File = Join-Path $OutputDir "LUMA_ANDROID_KEYSTORE_BASE64.txt"
[IO.File]::WriteAllText($Base64File, $Base64)

Write-Host ""
Write-Host "Created:"
Write-Host "  $Keystore"
Write-Host "  $Base64File"
Write-Host ""
Write-Host "GitHub Actions secrets required:"
Write-Host "  LUMA_ANDROID_KEYSTORE_BASE64 = complete content of LUMA_ANDROID_KEYSTORE_BASE64.txt"
Write-Host "  LUMA_ANDROID_KEYSTORE_PASSWORD = keystore password"
Write-Host "  LUMA_ANDROID_KEY_ALIAS = $Alias"
Write-Host "  LUMA_ANDROID_KEY_PASSWORD = key password"
Write-Host ""
Write-Host "IMPORTANT: Never commit local-signing/ or the keystore. Back up the JKS and passwords in two secure locations."
