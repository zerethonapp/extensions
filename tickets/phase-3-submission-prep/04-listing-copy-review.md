# P3-04 — Self-review listing copy for vagueness / keyword stuffing

- **Status**: 🟡 plan
- **Phase**: 3
- **Priority**: P1
- **Estimate**: 30 minutes
- **Blocks**: P4-01
- **Blocked by**: —

## Goal
A non-author reads [`docs/LISTING.md`](../../docs/LISTING.md) and flags anything vague, keyword-stuffed, or factually wrong before submission.

## Why
"Misleading or keyword-stuffed description" is one of the named Chrome Web Store rejection reasons. Self-review is the cheapest catch for it. A single pass by someone who didn't write the copy usually catches 80% of weak phrasing.

## Acceptance criteria
- [ ] Reviewer reads `docs/LISTING.md` end-to-end
- [ ] No bullet contains > 3 keywords without surrounding prose (e.g., reject "json formatter, json beautifier, json validator, json minifier" as standalone bullet)
- [ ] No claim that is currently false ("works offline" — false in v0.1, must say "v0.2 roadmap" if mentioned)
- [ ] No claim that depends on un-shipped BE work as if it already shipped (e.g., "right-click and the text auto-prefills" → requires P2-02 to be true)
- [ ] No competitor names ("better than X") — store policy bans direct competitor comparisons
- [ ] Description is plain text (line breaks preserved); no markdown syntax visible
- [ ] Title ≤ 75 chars; tagline ≤ 132 chars (counted as rendered, not source)
- [ ] Single Purpose declaration is a single sentence
- [ ] Privacy section in description matches `docs/PRIVACY.md` (no contradictions)

## Implementation notes
- Have the reviewer copy-paste the description into a 75-char × 16,000-char text box to see character counts
- If using AI for review, prompt: "You are a Chrome Web Store reviewer. Read this listing description and flag any phrase that is (a) vague, (b) keyword-stuffed, (c) a false claim. Be strict."

## Done definition
- [ ] At least one non-author has reviewed
- [ ] All flagged issues either fixed in `docs/LISTING.md` or explicitly waived with a comment
- [ ] Dashboard updated to 🟢 done

## Updates
- 2026-05-23: created
