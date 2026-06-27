# Out Lived! deep links on zagmob.com

## How hosting works today

**zagmob.com runs on GitHub Pages** (see `CNAME` + DNS → `185.199.x.x`).

These files are from a prior attempt at **Cloudflare Pages / Netlify** and are **ignored by GitHub Pages**:

- `_redirects`
- `_headers`

Do not rely on them unless you migrate off GitHub Pages.

## What makes `/p/{slug}` work on GitHub Pages

1. **`404.html`** — GitHub Pages serves this for missing paths but **keeps the URL** (`/p/TXVoYW1tYWQ`).
2. **`js/deeplink-landing.js`** — Detects `/p/…`, decodes the base64url slug, renders the install landing.
3. **`p.html`** — Same landing (useful if you later move to Cloudflare Pages with `_redirects`).

App shares links like:

```
https://zagmob.com/p/TXVoYW1tYWQ
```

## Universal Links / App Links verification files

| Platform | URL | Status |
|----------|-----|--------|
| iOS | `/.well-known/apple-app-site-association` | Required |
| iOS (mirror) | `/apple-app-site-association` | Apple checks both |
| Android | `/.well-known/assetlinks.json` | Required |

**GitHub Pages quirk:** AASA is often served as `application/octet-stream` instead of `application/json`. This works for many apps; if iOS refuses to open links, put **Cloudflare (free) in front of GitHub Pages** and add a Transform Rule:

- If URL path equals `/.well-known/apple-app-site-association` or `/apple-app-site-association`
- Set response header `Content-Type` = `application/json`

No need to move the site — keep GitHub as origin.

## App-side checklist (outlived repo)

- [x] `DeepLinkService` + share URLs with `/p/{base64slug}`
- [x] Android `intent-filter` with `android:autoVerify="true"` for `https://zagmob.com/p/`
- [x] iOS `Runner.entitlements` with `applinks:zagmob.com`
- [x] `CODE_SIGN_ENTITLEMENTS` set in Xcode project
- [ ] **Apple Developer → App ID → Associated Domains** enabled for `com.zagmob.outlived`
- [ ] Ship a new iOS/Android build after entitlements fix

## Verify after deploy

```bash
# Web fallback (no app installed)
curl -sI https://zagmob.com/p/TXVoYW1tYWQ | head -5
# Should be 404 from GitHub but body is our 404.html landing

# iOS association file
curl -s https://zagmob.com/.well-known/apple-app-site-association | jq .

# Android asset links
curl -s https://zagmob.com/.well-known/assetlinks.json | jq .
```

On a phone **with the app installed**, open:

```
https://zagmob.com/p/TXVoYW1tYWQ
```

Expected: Out Lived! opens to Muhammad (today’s outlived view + person detail).

On a phone **without the app**: branded landing with store buttons.

## Optional: Cloudflare Pages later

If you retry Cloudflare Pages, `_redirects` can rewrite `/p/*` → `/p.html` with HTTP 200. Until then, `404.html` is the GitHub-native solution.