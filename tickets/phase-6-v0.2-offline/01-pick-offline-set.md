# P6-01 — Pick offline-port set from usage data

- **Status**: 🟡 plan
- **Phase**: 6 (v0.2 selective offline bundling)
- **Priority**: P1
- **Estimate**: 2 hours analysis + 1 meeting to confirm
- **Blocks**: P6-02 (cannot port until we know which tools)
- **Blocked by**: P4-03 (need ≥ 30 days of post-launch data), P5-02 (need telemetry data — OR fall back to qualitative signals)

## Goal
Decide which 5-10 tools to port offline in v0.2, based on real usage data from the install base, not pre-launch guesses.

## Why
The v0.1 candidate list in `PLAN.md` §2.1 was 15 tools picked from a mix of intuition and "looks easy to port". Real usage will rank them differently. Picking the wrong tools wastes 3-4 weeks of port work.

## Acceptance criteria
- [ ] Pull telemetry from P5-02 (or fall back to qualitative signals if P5-02 not shipped — see below)
- [ ] Compute per-slug `(open_count, distinct_users_proxy)` over the last 30 days
- [ ] Rank by `distinct_users_proxy × log(open_count)` to weight popularity without rewarding heavy power-users
- [ ] Top 10 + privacy-critical tools shortlist (any tool handling secrets, even if not top-10: e.g., password generator, hash of secrets)
- [ ] Drop tools whose offline port is technically infeasible (require server-side processing, large JS libraries > 50 KB each)
- [ ] Final picks list documented in this ticket with reasoning per pick
- [ ] Update `BUNDLED_SLUGS` in [`src/lib/tools-registry.js`](../../src/lib/tools-registry.js) — fill the Set with chosen slugs
- [ ] Update `KEEP_BUNDLED` in [`scripts/sync-tools-registry.mjs`](../../scripts/sync-tools-registry.mjs) so sync preserves the flags

## Fallback if telemetry (P5-02) not shipped
Use qualitative signals:
- Tools whose name contains the most-searched terms in store search (Chrome dashboard → Statistics → "What people searched")
- Tools reviewers ask for explicitly in store reviews ("can JSON Formatter work offline?")
- Tools whose `?ref=ext` open count is highest in `tools.zerethon.com` server logs (no per-user telemetry needed — just aggregate hit counts)

The third option (server-log aggregation) is the most actionable since it does not need extension-side telemetry at all — `tools.zerethon.com` already counts hits.

## Implementation notes
- Strong contenders without data: `json-formatter`, `base64-encoder`, `hash-generator`, `password-generator`, `uuid-generator`. These are "I need it now, offline" type tools.
- Anti-contenders: `image-compressor`, `image-resizer`, `webp-converter` — large libs, browser-native APIs sufficient on the website
- Privacy-critical: `password-generator` should bundle even if usage is low — sending an unhashed password through a URL query feels wrong to users
- The 15 candidates flagged in [`PLAN.md`](../../PLAN.md) §2.1 are a starting list; the data ranks them

## Done definition
- [ ] Final picks list in this ticket (5-10 slugs with reasoning)
- [ ] BUNDLED_SLUGS updated
- [ ] sync script updated
- [ ] Verify still passes after the flag change
- [ ] Dashboard updated to 🟢 done

## Updates
- 2026-05-23: created
