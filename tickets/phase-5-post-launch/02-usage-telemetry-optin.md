# P5-02 — Add opt-in usage telemetry for v0.2 decision

- **Status**: ➖ deferred
- **Phase**: 5
- **Priority**: P2
- **Estimate**: 1 day
- **Blocks**: P6-01 (data-driven offline-port picks need telemetry data)
- **Blocked by**: P4-03 (install base ≥ 500 to justify the work)

## Goal
Add **opt-in** anonymous usage telemetry so we can ground v0.2 offline-port decisions in real user behavior, not guesses.

## Why
Phase 6's whole premise is "port the tools users actually use, not the ones we think they'll use". Without telemetry we'd have to guess at the top-5 tool list. Even a tiny opt-in stream from 10% of installs over 30 days is enough signal.

## Critical: opt-in only
Default OFF. Add a single toggle in the popup or a separate options page: "Help improve Zerethon Tools — share anonymous tool-open events". Privacy-first is the brand; this must not break that promise.

## Acceptance criteria
- [ ] New permission in manifest: **only** `host_permissions` already covers it (we already POST to `tools.zerethon.com`)
- [ ] Options page or popup toggle "Send anonymous usage data" (default OFF)
- [ ] When ON: each tool open sends a POST to `tools.zerethon.com/api/internal/ext-event` with body `{ event: 'tool_open', slug, src }` only — no IDs, no IPs (BE drops the IP), no user-agent details beyond what HTTP requires
- [ ] BE: new route + controller + queueable job that aggregates into a daily counts table (no per-event row retention)
- [ ] Privacy policy (`docs/PRIVACY.md` + `/extension/privacy` page) updated to disclose this opt-in capability
- [ ] First-run banner explaining the toggle (one dismiss + remember)
- [ ] Telemetry can be revoked instantly by toggling OFF — verify no further requests
- [ ] After 30 days of data: query daily counts to rank tools by `slug` frequency — output drives P6-01

## Implementation notes
- Why not Google Analytics or Plausible? Both would require `<all_urls>` or third-party host permission → review risk + privacy claim damage
- Why not local-only counting? We need cross-user aggregation to know what's popular; per-user data alone won't tell us if `json-formatter` is used by 1% or 50% of installs
- Aggregation table shape: `(date, slug, src, count)` — no PII, no user grouping, no session IDs
- BE rate-limit: `throttle:200,1` on the event endpoint per IP (rough abuse cap)
- BE: drop `X-Forwarded-For` / `REMOTE_ADDR` before logging — log only `{date, slug, src}` triples

## Done definition
- [ ] Opt-in toggle works
- [ ] Telemetry payload audited via extension's network panel: zero data when OFF, only the documented shape when ON
- [ ] Privacy disclosures match implementation
- [ ] Dashboard updated to 🟢 done

## Updates
- 2026-05-23: created (deferred)
