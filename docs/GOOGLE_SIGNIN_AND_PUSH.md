# Google Sign-In, saved progress, and push notifications

## Google Sign-In (same model as Backstabbr)
Backstabbr signs you in with a Google account. This project does the same, using **Google Identity Services (GIS)** — no passwords ever touch this app.

**Turn it on (2 minutes, free):**
1. Google Cloud Console → *APIs & Services → Credentials → Create credentials → OAuth client ID → Web application*.
2. Add your Pages origin as an *Authorised JavaScript origin* (e.g. `https://rtmalikian.github.io`).
3. Paste the Client ID into the app under **AI & Settings → Google Sign-In** (stored in your browser), or hard-code it in `js/app.js` `settings.googleClientId` default for your own deployment.

**How saves work.** When signed in, saves/orders/press are keyed to your Google `sub` (the stable account id) in this device's local storage — deliberately *not* the email address, because Backstabbr's 2020 login migration taught everyone what breaks when identity keys on email. Signed-out play uses a `guest` profile; **Demo sign-in** exercises the identical flow without a Client ID. Export/Import save (Orders tab) moves a game between devices today; a hosted backend (Firestore/Supabase) can sync the same JSON across devices — the save format is a single versioned JSON object to make that a drop-in.

## Push notifications
**What works today, no server:** once granted, the app posts local notifications from the service worker for turn resolution and incoming (bot/local) press, and the installed Android PWA shows them like native notifications. `sw.js` also implements the standard `push` event handler.

**Real cross-device Web Push (when you want it):** Web Push requires a small server that holds a VAPID private key — a static GitHub Pages site cannot send pushes by itself, by design of the platform. Minimal path:
1. Generate VAPID keys (`npx web-push generate-vapid-keys`).
2. In the app (extension point in `sw.js`/`app.js notify()`), call `registration.pushManager.subscribe({applicationServerKey: <public key>, userVisibleOnly:true})` and POST the subscription JSON to your server.
3. Server (any tiny Node/Python service) uses `web-push` to send `{title, body, url}` payloads on phase deadlines / new press. `sw.js` already renders exactly that payload and focuses/opens the game on tap.
Android note: Chrome PWAs receive Web Push through FCM under the hood — no Firebase project or Play Store account is needed for the PWA route.

## Android app routes (all from this one codebase)
- **PWA install (default):** open the Pages URL in Chrome on Android → *Add to Home screen / Install app*. Full-screen, offline shell, notifications.
- **Trusted Web Activity:** `bubblewrap init --manifest <pages-url>/manifest.webmanifest` wraps the same PWA for Google Play.
- **Capacitor:** `android/capacitor.config.json` is included as a starting point for a native WebView shell with native push (FCM) if you later want Play Store push tokens.
