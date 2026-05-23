# P2-03 — Landing page `/extension` + email waitlist

- **Status**: 🟢 done (2026-05-23)
- **Phase**: 2
- **Priority**: P1
- **Estimate**: 1 day
- **Blocks**: —
- **Blocked by**: —
- **Repo**: `tools/` (Laravel)

## Goal
Public landing page at `https://tools.zerethon.com/extension` introducing the browser extension, with "Add to Chrome" / "Add to Edge" CTA buttons (links populated post-publish) and an email-capture form for a launch-day announcement list.

## Why
- **Install conversion**: site visitors who don't know we have an extension get a clear path to install it
- **Launch-day ranking signal**: Chrome Web Store uses install velocity in the first 72 hours as a ranking factor. A pre-built waitlist of 100-500 emails turned into Day-1 installs is one of the highest-ROI launch tactics
- **SEO**: the page itself ranks for "zerethon tools extension" type queries
- **Pre-launch UX**: ship the page BEFORE the extension is approved so the form is collecting emails during the 3-7 day review

## Acceptance criteria
- [ ] Route registered: `GET /extension` → name `extension.landing`
- [ ] Controller `ExtensionLandingController@show` returns view `extension.landing`
- [ ] Page renders without auth, mobile-responsive, matches site design
- [ ] Hero section: title, one-paragraph pitch, install CTAs (placeholder URLs until P4-01 / P4-02 land)
- [ ] Feature section: 4-5 bullets (search 111 tools, context menu, side panel, omnibox `zt`, privacy-first)
- [ ] Screenshots / animated GIF of the extension in action (use the 5 from P3-01 once captured)
- [ ] Email waitlist form: single-field, POST to `/extension/waitlist`, stored in a new table or sent to existing newsletter provider
- [ ] Waitlist form: rate-limited (throttle:5,1 like other public POSTs), CSRF-protected, validates RFC 5321 email
- [ ] Pre-launch: install CTAs say "Coming soon — get notified" and link to the form anchor
- [ ] Post-launch (P4-01 done): swap CTAs to real Chrome / Edge store URLs; convert waitlist users via a launch announcement email
- [ ] Linked from footer (footer.blade.php) under "Products" or similar
- [ ] Added to `sitemap.xml` via `SeoController@sitemap`
- [ ] OpenGraph + Twitter Card meta tags

## Implementation notes
- Reuse existing legal-layout structure as a starting point, then style up the hero
- For waitlist storage: cheapest = new table `extension_waitlist_subscribers` with `(id, email, created_at, source, notified_at NULLABLE)`. If we already use Mailchimp / ConvertKit / Resend for newsletters, hook into that instead.
- Don't auto-send a welcome email pre-launch — too much risk of spam complaints if launch slips. Send one batch when extension goes live.
- Bonus: capture `?utm_source=…` so we can measure which channels drove waitlist signups (Twitter vs. blog vs. footer link)
- Bonus: a "How does it work?" demo GIF saves users from having to install just to see the popup

## Done definition
- [ ] Page live, returns 200
- [ ] Waitlist form successfully captures + persists an email (test with own address)
- [ ] Footer link exists and works
- [ ] Page passes Lighthouse accessibility ≥ 90
- [ ] Dashboard updated to 🟢 done

## Updates
- 2026-05-23: created
- 2026-05-23: shipped. Migration `2026_05_23_000000_create_extension_waitlist_subscribers_table` (email unique, sha256 ip_hash, source, notified_at). Routes `GET /extension` + `POST /extension/waitlist` (throttle:5,1). Files: `ExtensionLandingController`, `ExtensionWaitlistRequest`, `ExtensionWaitlistSubscriber` model, `config/extension.php` (env-driven store URLs), `resources/views/extension/landing.blade.php`. Pre-launch CTAs collapse to waitlist when `EXT_CHROME_STORE_URL` is unset. Added to footer + sitemap. 5 feature tests (signup persists, idempotent on duplicate, rejects invalid email, ip hashed not raw, landing renders) — all green. Status → 🟢 done.
