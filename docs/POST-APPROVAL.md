# Post-approval runbook

What to do once Chrome (or Edge) approves the listing. Steps are
paste-ready and idempotent — re-running won't double-email or
overwrite. Most of the work has been automated; the human-only
bits are dashboard clicks and physical-machine smoke tests.

---

## When Chrome approves

You'll get an email from `webstore-noreply@google.com`. The item is
**Unlisted** at this point — only people with the direct URL can see
it. Time-box: 3-day soak → flip Public.

### A. Capture the listing URL

In Chrome Web Store devconsole → click your item → the URL bar shows:
```
https://chrome.google.com/webstore/detail/<lower-case-id>
```
Save it. You'll paste it in step C and E.

> Newer Chrome shows the listing at `https://chromewebstore.google.com/detail/<id>`. Both work; the announce script accepts either.

### B. 3-day Unlisted soak — smoke test on 3 machines

For each of 3 different devices (best: 1 Mac + 1 Windows/Linux + 1 personal vs work profile):

- [ ] Install via the Unlisted URL from step A
- [ ] Run through [`docs/SMOKE-TEST.md`](SMOKE-TEST.md) sections 1, 2, 3, 5, 6, 7
- [ ] Watch the toolbar icon + try the 3 offline tools airplane-mode (DevTools → Network → Offline)
- [ ] Try the right-click context menu on a webpage selection
- [ ] If anything breaks → log the bug, decide if it's a stop-ship — if yes, bump to 0.2.1 + resubmit; if no, ship Public and fix in 0.2.1 later

### C. Flip to Public

Chrome Web Store devconsole → your item → **Distribution** tab:
- Change **Visibility** from Unlisted → **Public**
- Save → Submit. Chrome treats visibility change as a re-submission and propagates within ~1 hour (sometimes faster).

### D. Update `tools/` backend with the live URL

In the `tools/` repo:

```bash
# Add to .env (production):
EXT_CHROME_STORE_URL=https://chrome.google.com/webstore/detail/<your-item-id>
```

Then redeploy `tools/` so `config/extension.php` picks up the new value.
The landing page at `tools.zerethon.com/extension` auto-swaps the
"Get notified" CTA for an "Add to Chrome" button when this env var is
non-null (see `resources/views/extension/landing.blade.php` `@if($chromeStoreUrl)`).

Verify:
```bash
curl -s https://tools.zerethon.com/extension | grep -E 'Add to Chrome|Get notified'
# expect: "Add to Chrome" (not "Get notified")
```

### E. Email the waitlist

The announcement Mailable + Artisan command are already built in
`tools/`. Run from the `tools/` directory on the production server (or
SSH into the running Laravel host):

```bash
# 1. Dry-run first — shows recipient list without sending:
php artisan extension:announce-launch \
  'https://chrome.google.com/webstore/detail/<your-item-id>' \
  --dry-run

# 2. Real send (will prompt to confirm):
php artisan extension:announce-launch \
  'https://chrome.google.com/webstore/detail/<your-item-id>'
```

Behaviour:
- Sends to every `extension_waitlist_subscribers` row where `notified_at IS NULL`
- Marks `notified_at` on successful send → re-running is safe (already-notified rows are skipped)
- Failed sends are NOT marked — re-run to retry only the failures
- `--limit=N` for staged rollout (vd 50 subscribers first to check inbox placement)
- `--edge-store-url=…` if both Chrome + Edge are live by the time you send (recommended: wait until both are live so the email shows both buttons)

Email template: `resources/views/emails/extension-launch.blade.php` (HTML)
+ `extension-launch-text.blade.php` (plain-text fallback). One-shot
announcement — no "weekly newsletter" follow-up.

### F. Update ticket statuses

```bash
cd /Users/leeseawuyhs/MyData/MyProject/Social/extensions
# Update these files:
# - tickets/phase-4-submission/01-chrome-web-store-submit.md → 🟢 done
# - tickets/README.md (P4-01 row → 🟢 done)
git add tickets/ && git commit -m "P4-01: Chrome listing public — <listing-url>"
git push origin main
```

---

## When Edge approves

Edge submission follows Chrome by 1-3 days (much smoother review).

### G. Edge submission (only after Chrome is Public)

Follow [`docs/SUBMIT.md`](SUBMIT.md) **Part B** — upload the same
`zerethon-tools-v0.2.0.zip`, re-enter listing fields, submit.

### H. Update `tools/` with Edge URL

```bash
# Add to .env (production):
EXT_EDGE_STORE_URL=https://microsoftedge.microsoft.com/addons/detail/<your-id>
```

Redeploy. Landing page now shows BOTH Chrome + Edge buttons.

### I. Send Edge announcement (skip if waitlist already got Chrome email)

If you already ran step E with `--edge-store-url`, no second email
needed. If you sent Chrome-only email and want a follow-up for Edge:

Options:
- **No follow-up**: cleanest. Edge users find it via Edge add-ons search or the landing page.
- **Manual NULL update** + re-run announce: only if you really want
  to re-blast (will look like spam to people who already installed Chrome).
  ```bash
  php artisan tinker
  > \App\Models\ExtensionWaitlistSubscriber::whereNotNull('notified_at')->update(['notified_at' => null]);
  ```
  Then re-run `extension:announce-launch <chrome-url> --edge-store-url=<edge-url>`.

I'd skip the second email. Edge installs trickle in from the landing
page and Edge store search organically.

---

## Rejection branch (Chrome OR Edge)

If you get a rejection email, it'll cite the exact policy section.

1. Read the email — Google/Microsoft are specific
2. Fix EXACTLY that one thing in code or listing. Don't over-edit.
3. Bump `src/manifest.json` and `package.json` version: `0.2.0` → `0.2.1`
4. `npm run verify && npm run build:prod`
5. Re-upload the new zip
6. Add a one-line reply in the appeals form: "Fixed: <what you changed>"

Common rejection categories + canned responses are in
[`tickets/phase-4-submission/01-chrome-web-store-submit.md`](../tickets/phase-4-submission/01-chrome-web-store-submit.md) §"Common rejection reasons".

---

## After Public — first 7 days monitoring

See [`tickets/phase-4-submission/03-monitor-7-days.md`](../tickets/phase-4-submission/03-monitor-7-days.md).

Daily 15-30 minute pass:
- Chrome Web Store devconsole → Reviews tab → reply to every review (positive or negative) within 24h
- Edge Add-ons → Reviews tab → same
- Watch `support@zerethon.com` inbox
- Run `chrome://extensions` "Errors" check on the installed extension once a day
- If any 1-star review names a fixable bug → bump 0.2.1, fix, resubmit

Day 7 — record install count + DAU/MAU in the monitor ticket Updates section. If install count > 500 → P6-01 (offline-port v0.3 decision) becomes actionable.
