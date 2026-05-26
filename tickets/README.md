# Tickets — Zerethon Tools Extension

Status dashboard. Each row links to its ticket file. Update the box + the file
when status changes.

Legend: 🟢 done · 🔵 in progress · 🟡 plan · ⛔ blocked · ➖ deferred

---

## Phase 0 — Pre-launch admin

| # | Ticket | Status | Priority | Notes |
|---|---|---|---|---|
| P0-01 | [Reserve Chrome Web Store listing name](phase-0-admin/01-reserve-chrome-store-name.md) | 🟡 plan | P0 | $5 fee, 15 min — do today |
| P0-02 | [Verify domain `zerethon.com` for publisher badge](phase-0-admin/02-verify-domain.md) | 🟡 plan | P1 | Search Console DNS TXT |
| P0-03 | [Push extension repo to `github.com/zerethonapp/extensions`](phase-0-admin/03-publish-github-repo.md) | 🟡 plan | P1 | Open source = reviewer goodwill |

## Phase 1 — Extension MVP code (shipped 2026-05-23)

| # | Ticket | Status | Priority | Notes |
|---|---|---|---|---|
| P1-00 | [Shipped checklist (retrospective)](phase-1-extension-mvp/00-shipped-checklist.md) | 🟢 done | — | 17 features, 30 KB zip, verify clean |

## Phase 2 — Backend work in `tools/` repo

| # | Ticket | Status | Priority | Notes |
|---|---|---|---|---|
| P2-01 | [Privacy policy page at `/extension/privacy`](phase-2-be-work/01-privacy-policy-page.md) | 🟢 done | **P0 BLOCKER** | Shipped 2026-05-23. 2 tests pass. |
| P2-02 | [Context-menu prefill on 5 tool views](phase-2-be-work/02-context-menu-prefill.md) | 🟢 done | **P0 BLOCKER** for UX value | Shipped 2026-05-23. `zrDecodePrefill()` + 5 init() patches. |
| P2-03 | [Landing page `/extension` + email waitlist](phase-2-be-work/03-landing-page-waitlist.md) | 🟢 done | P1 | Shipped 2026-05-23. Migration + 5 waitlist tests pass. |
| P2-04 | [Cache-Control header on `/api/internal/tools.json`](phase-2-be-work/04-tools-json-cache-headers.md) | 🟢 done | P3 | Shipped 2026-05-23. ETag + 304 path tested. |

## Phase 3 — Submission prep

| # | Ticket | Status | Priority | Notes |
|---|---|---|---|---|
| P3-01 | [Capture 5 screenshots 1280×800 from real Chrome](phase-3-submission-prep/01-capture-screenshots.md) | 🟢 done (2026-05-26) | P0 | 5 PNG @ exact 1280×800 in `store-assets/{chrome,edge}/screenshots/`. #5 has minor caveat (perm list cut). |
| P3-02 | [Design promo tiles (440×280 + 1400×560)](phase-3-submission-prep/02-design-promo-tiles.md) | 🟡 plan | P0 | 440×280 required, 1400×560 boosts visibility |
| P3-03 | [Final QA smoke test (every surface, both i18n)](phase-3-submission-prep/03-final-qa-smoke-test.md) | 🟡 plan | P0 | All surfaces work on a clean profile |
| P3-04 | [Self-review listing copy for vagueness / keyword stuffing](phase-3-submission-prep/04-listing-copy-review.md) | 🟡 plan | P1 | One non-author reads docs/LISTING.md |

## Phase 4 — Store submission

| # | Ticket | Status | Priority | Notes |
|---|---|---|---|---|
| P4-01 | [Chrome Web Store submit (Unlisted → Public)](phase-4-submission/01-chrome-web-store-submit.md) | 🟡 plan | P0 | 3-7 day review queue |
| P4-02 | [Edge Add-ons submit (same zip)](phase-4-submission/02-edge-addons-submit.md) | 🟡 plan | P1 | 1-3 day review |
| P4-03 | [Monitor first 7 days reviews + crash reports](phase-4-submission/03-monitor-7-days.md) | 🟡 plan | P1 | Catch regressions early |

## Phase 5 — Post-launch v0.1.x

| # | Ticket | Status | Priority | Notes |
|---|---|---|---|---|
| P5-01 | [Firefox AMO port (deferred)](phase-5-post-launch/01-firefox-port.md) | ➖ deferred | P3 | Needs `background.scripts` + `sidebar_action` rework |
| P5-02 | [Add opt-in usage telemetry for v0.2 decision](phase-5-post-launch/02-usage-telemetry-optin.md) | ➖ deferred | P2 | Only after install base proves demand |

## Phase 6 — v0.2 selective offline bundling (~30 days post-launch)

| # | Ticket | Status | Priority | Notes |
|---|---|---|---|---|
| P6-01 | [Pick offline-port set from usage data](phase-6-v0.2-offline/01-pick-offline-set.md) | 🔵 partial (3/5) | P1 | 3 universal winners picked pre-data; 2 slots reserved for telemetry-driven picks |
| P6-02 | [Port 5-10 tools to vanilla JS offline](phase-6-v0.2-offline/02-port-tools.md) | 🔵 partial (3/5) | P2 | 2026-05-23: json-formatter, base64-encoder, hash-generator ported (39 KB total) |
| P6-03 | [v0.2 release (resubmit Chrome + Edge)](phase-6-v0.2-offline/03-v0.2-release.md) | ⏭ merged into P4-01 | — | Path A chosen 2026-05-23 — v0.2 IS the initial release. No resubmit needed; P4-01 ships v0.2.0 directly. |

---

## Critical path (must-do before public launch)

```
P0-01 ──┐
        ├──► P4-01 ──► P4-02 ──► P4-03
P2-01 ──┤
P2-02 ──┘                ▲
                         │
        P3-01 ──► P3-03 ─┤
        P3-02 ───────────┤
        P3-04 ───────────┘
```

Everything else is parallel-safe.

## Conventions

- Each ticket file is self-contained — goal, why, acceptance criteria, impl notes.
- Update the dashboard checkbox **and** the file's `Status:` line at the same time.
- New tickets: copy [`_template.md`](_template.md), prefix `PX-NN-…`, link from this README.
- Done tickets stay in the file tree (not deleted) — they are the audit trail.
