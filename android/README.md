# Android

Three routes, same codebase — start with #1.

## 1. Install the PWA (no store, no build)
Open https://rtmalikian.github.io/backstabplomacy/ in Chrome on your Android phone → ⋮ menu → **Install app / Add to Home screen**. You get a full-screen app icon, offline play, saved games on-device, and notifications. This is the route the live site is tuned for (manifest + service worker).

## 2. Trusted Web Activity (Play Store listing of the same PWA)
```bash
npm i -g @bubblewrap/cli
bubblewrap init --manifest https://rtmalikian.github.io/backstabplomacy/manifest.webmanifest
bubblewrap build
```
Requires a Digital Asset Links file (`/.well-known/assetlinks.json`) on the domain — add it to this repo's Pages root once you have the signing key fingerprint.

## 3. Capacitor native shell
`capacitor.config.json` in this folder points at the web app. With Node + Android Studio:
```bash
npm init -y && npm i @capacitor/core @capacitor/cli @capacitor/android @capacitor/push-notifications
npx cap add android && npx cap sync && npx cap open android
```
Use `@capacitor/push-notifications` + FCM if you want native push tokens instead of Web Push.
