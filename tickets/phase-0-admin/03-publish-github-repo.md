# P0-03 — Publish extension repo to `github.com/zerethonapp/extensions`

- **Status**: 🟡 plan
- **Phase**: 0
- **Priority**: P1
- **Estimate**: 1 hour (repo setup + first push + README polish)
- **Blocks**: P3-04 (listing copy mentions the repo URL), P4-01 (privacy policy and listing reference the URL)
- **Blocked by**: —

## Goal
Make the `extensions/` source tree publicly readable at `github.com/zerethonapp/extensions` (or chosen org). Reproducible builds (`npm run build`) produce the byte-identical zip submitted to stores.

## Why
- Reviewer goodwill — "verifiable build claim" sits in listing description
- Trust signal in the privacy policy ("the full source is open at …")
- Lets users audit recents/favorites storage themselves
- Future contributors can submit PRs for new locale strings

## Acceptance criteria
- [ ] Repo created on GitHub under `zerethon` org (create the org if it doesn't exist)
- [ ] First push of current `extensions/` tree (everything except `dist/` and `*.zip`)
- [ ] Top-level `README.md` polished: install instructions, build modes, repo layout
- [ ] `LICENSE` is MIT (already present)
- [ ] GitHub Actions workflow added (optional, P2) that runs `npm run verify` on PR
- [ ] Repo URL `https://github.com/zerethonapp/extensions` referenced in:
  - `docs/PRIVACY.md` "Source" section
  - `docs/LISTING.md` description block
  - `tools.zerethon.com/extension/privacy` Blade view (after P2-01)

## Implementation notes
- Make sure `.gitignore` already covers `node_modules/`, `dist/`, `*.zip` (it does — see [.gitignore](../../.gitignore))
- First push: `git init && git add . && git commit -m "Initial v0.1.0" && git remote add origin git@github-zerethon:zerethonapp/extensions.git && git push -u origin main`
- Tag the release: `git tag v0.1.0 && git push --tags`
- Consider attaching `zerethon-tools-v0.1.0.zip` to the GitHub release page for byte-identical comparison

## Done definition
- [ ] Repo public + accessible without auth
- [ ] README renders correctly on GitHub (preview check)
- [ ] Tagged v0.1.0 release exists
- [ ] Dashboard updated to 🟢 done

## Updates
- 2026-05-23: created
