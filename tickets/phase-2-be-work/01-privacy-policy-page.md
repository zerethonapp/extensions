# P2-01 — Privacy policy page at `/extension/privacy`

- **Status**: 🟢 done (2026-05-23)
- **Phase**: 2 (BE work in `tools/` repo)
- **Priority**: **P0 BLOCKER** for Chrome submission
- **Estimate**: 1-2 hours
- **Blocks**: P4-01 (Chrome will not accept submission without a 200 at the disclosed Privacy Policy URL)
- **Blocked by**: —
- **Repo**: `tools/` (Laravel)

## Goal
Serve `https://tools.zerethon.com/extension/privacy` with the privacy policy text from [`extensions/docs/PRIVACY.md`](../../docs/PRIVACY.md). Must return HTTP 200 with valid HTML before the Chrome submission form will save.

## Why
Chrome Web Store requires a Privacy Policy URL for any item that declares data handling (we declare "Website content" because the context menu transmits selected text in the URL). The URL is checked during submission — a 404 blocks save.

## Acceptance criteria
- [ ] Route registered: `GET /extension/privacy` → name `legal.extension-privacy`
- [ ] Controller method `LegalController@extensionPrivacy` returns view `legal.extension-privacy`
- [ ] Blade view `resources/views/legal/extension-privacy.blade.php` renders content from `extensions/docs/PRIVACY.md` (HTML-converted)
- [ ] Page extends the standard legal layout (matches `/privacy` and `/terms` styling)
- [ ] Last-updated date matches `extensions/docs/PRIVACY.md` frontmatter
- [ ] Page is crawlable (no `noindex`) and listed in `sitemap.xml`
- [ ] `curl -I https://tools.zerethon.com/extension/privacy` returns `200 OK`

## Implementation notes
- Existing routes for reference: see `tools/routes/web.php` legal section:
  ```php
  Route::get('/privacy', [LegalController::class, 'privacy'])->name('legal.privacy');
  Route::get('/terms', [LegalController::class, 'terms'])->name('legal.terms');
  ```
- Add new entry alongside them:
  ```php
  Route::get('/extension/privacy', [LegalController::class, 'extensionPrivacy'])->name('legal.extension-privacy');
  ```
- Controller method follows the same pattern as `LegalController@privacy` / `@terms` — just point at the new view.
- Convert `extensions/docs/PRIVACY.md` to Blade: render markdown → HTML inside the layout, or hand-convert sections (preferred — gives us full styling control).
- Update `tools/app/Http/Controllers/SeoController@sitemap` to include the new route in the sitemap XML.
- Email contact: `support@zerethon.com` (already used in the privacy doc).

## Done definition
- [ ] All acceptance criteria checked
- [ ] `curl -I https://tools.zerethon.com/extension/privacy` returns 200
- [ ] Page reviewed by a non-author for accuracy against [`docs/PRIVACY.md`](../../docs/PRIVACY.md)
- [ ] Dashboard updated to 🟢 done

## Updates
- 2026-05-23: created
- 2026-05-23: shipped. Added route `GET /extension/privacy`, `LegalController@extensionPrivacy`, view `legal.extension-privacy.blade.php`. Added to `sitemap.xml` via `SeoController`. Footer link added. 2 feature tests pass (`ExtensionTest::test_extension_privacy_page_renders`, `::test_extension_privacy_sets_canonical`). Status → 🟢 done.
