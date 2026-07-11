# Out Lived! deep links on zagmob.com

## How hosting works today

**zagmob.com runs on GitHub Pages** (see `CNAME` + DNS → `185.199.x.x`).

These files are from a prior attempt at **Netlify** (and would also apply on Cloudflare Pages) and are **ignored by GitHub Pages**:

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

## Cloudflare (free) — after nameservers are Active

Keep GitHub Pages as origin. Cloudflare only proxies + rewrites.

### DNS checklist

- Apex `A` records → GitHub Pages `185.199.108–111.153` — **Proxied**
- `www` CNAME → GitHub Pages — **Proxied**
- `mail` / `autoconfig` / `autodiscover` CNAMEs → Private Email — **DNS only** (grey cloud)
- `MX` / SPF / DKIM `TXT` — **DNS only**
- SSL/TLS mode: **Full**

### Rule 1 — `/p/*` and `/g/*` return HTTP 200 (fixes Facebook “failed to load”)

GitHub Pages serves those paths as **404**. Facebook’s in-app browser treats that poorly.

**Rules → Overview → Create rule → URL Rewrite** (or Bulk Redirects / Dynamic Redirect depending on UI):

Option A — **Redirect Rules** (302 is OK for browsers; prefer rewrite if available):

Better: **Rules → Transform Rules → Rewrite URL** (or **Cloudflare Workers** free tier if rewrite UI is limited):

- If: `http.request.uri.path matches "^/p/"`  
  Then rewrite path to `/p.html` (keep query string)  
- If: `http.request.uri.path matches "^/g/"`  
  Then rewrite path to `/p.html` (same landing JS handles `/g/`)

After deploy, verify:

```bash
curl -sI https://zagmob.com/p/TXVoYW1tYWQ | head -5
# Expect: HTTP/2 200  (not 404)
```

### Rule 2 — AASA Content-Type

**Rules → Transform Rules → Modify Response Header**:

- If path is `/.well-known/apple-app-site-association` OR `/apple-app-site-association`
- Set static `Content-Type` = `application/json`

### Facebook / social in-app browsers

Universal Links are suppressed inside Facebook/Instagram. Landing page JS:

- **Android:** primary CTA uses `intent://…#Intent;scheme=https;package=com.zagmob.outlived;…`
- **iOS in FB:** copy-link + “Open in Safari” hint (cannot force UL from WebView)

After OG tags are live, refresh previews:  
https://developers.facebook.com/tools/debug/

## Death-date patches (Out Lived!)

Served at `https://zagmob.com/data/death-patches/` for **RELAUNCH-18** remote DB updates.

| File | URL |
|------|-----|
| Manifest | `https://zagmob.com/data/death-patches/manifest.json` |
| Patches | `https://zagmob.com/data/death-patches/0001.json` (zero-padded seq) |

**Publish workflow** (from `outlived` repo):

```bash
python db/deathdate_crawer.py
python db/export_death_patches.py
cp db/death_patches/* ../zagmob.com/data/death-patches/
# commit + push zagmob.com
```

Patch files are immutable once published; only append to `manifest.json`.

---

## App-side checklist (outlived repo)

**Full Mac mini / Apple Portal / release steps:** see  
`outlived/docs/DEEPLINKS_RELEASE_CHECKLIST.md` in the app repo.

- [x] `DeepLinkService` + share URLs with `/p/{base64slug}`
- [x] Android `intent-filter` with `android:autoVerify="true"` for `https://zagmob.com/p/`
- [x] iOS `Runner.entitlements` with `applinks:zagmob.com`
- [x] `CODE_SIGN_ENTITLEMENTS` set in Xcode project
- [ ] **Apple Developer → App ID → Associated Domains** enabled for `com.zagmob.outlived`
- [ ] Ship a new iOS/Android build after entitlements fix (official builds on Mac mini)

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