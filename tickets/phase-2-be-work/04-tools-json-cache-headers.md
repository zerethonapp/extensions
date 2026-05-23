# P2-04 — Cache-Control header on `/api/internal/tools.json`

- **Status**: 🟢 done (2026-05-23)
- **Phase**: 2
- **Priority**: P3 (not a launch blocker)
- **Estimate**: 30 minutes
- **Blocks**: —
- **Blocked by**: —
- **Repo**: `tools/` (Laravel)

## Goal
The public tools catalog endpoint sends `Cache-Control: public, max-age=3600, s-maxage=86400` so the extension's daily fetch doesn't hammer origin and intermediary CDNs / browsers can cache aggressively.

## Why
Once the extension is in users' browsers, the registry is fetched lazily for catalog updates. With 10,000+ daily active users hitting `/api/internal/tools.json` once each, even cheap requests add up. Browser-side caching keeps it free.

Note: today the extension uses a static snapshot baked at sync time, so this isn't strictly needed for v0.1. But:
- v0.2 will likely fetch live to surface newly-added tools without an extension update
- The same endpoint is hit by the on-site `Cmd+K` search dialog, so the cache benefit is real today

## Acceptance criteria
- [ ] `ToolListController@__invoke` returns response with `Cache-Control: public, max-age=3600, s-maxage=86400`
- [ ] Response includes `ETag` based on content hash (Laravel `Response::header()` + `md5(json)`)
- [ ] Conditional GET with `If-None-Match` returns `304 Not Modified` with no body
- [ ] CORS header `Access-Control-Allow-Origin: *` set (catalog is public)
- [ ] No `Set-Cookie` header (session middleware excluded — already done in `routes/web.php` for SEO routes; verify it applies here)

## Implementation notes
- File: `tools/app/Http/Controllers/ToolListController.php`
- Add headers via `response()->json(...)->header('Cache-Control', '…')->setEtag(md5($json))`
- Test with: `curl -i https://tools.zerethon.com/api/internal/tools.json | grep -i cache-control`
- Test conditional GET: `curl -i -H 'If-None-Match: "abc"' …` — should return 200 first time, 304 on repeat with correct ETag

## Done definition
- [ ] Headers verified via curl
- [ ] 304 path works
- [ ] Dashboard updated to 🟢 done

## Updates
- 2026-05-23: created
- 2026-05-23: shipped. `ToolListController` now returns `Cache-Control: public, max-age=3600, s-maxage=86400` + `ETag` (md5 of body) + `Access-Control-Allow-Origin: *` + `Vary: Accept-Encoding`. Conditional GET with `If-None-Match` returns 304. Note: kept Content-Type as bare `application/json` (no charset suffix) so the existing `SmokeTest::test_internal_tools_json_returns_array` assertion still matches — JSON is UTF-8 by RFC 8259 §8.1 anyway. 2 feature tests added (`tools_json_sends_cache_and_etag_headers`, `tools_json_returns_304_on_matching_if_none_match`). Status → 🟢 done.
