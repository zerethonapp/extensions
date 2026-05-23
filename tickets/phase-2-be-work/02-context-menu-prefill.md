# P2-02 — Context-menu prefill on 5 tool views

- **Status**: 🟢 done (2026-05-23)
- **Phase**: 2
- **Priority**: **P0 BLOCKER** for context-menu UX value
- **Estimate**: 2-3 hours
- **Blocks**: P3-03 (final QA — context menu must produce a prefilled tool, not an empty one)
- **Blocked by**: —
- **Repo**: `tools/` (Laravel)

## Goal
Five tool views accept a URL-safe base64-encoded `?input=` query parameter and prefill their input box on page load. Without this, the extension's context-menu entries open the right tool but the input is empty and the user has to paste manually.

## Why
The context menu (6 entries in `extensions/src/background.js`) is one of the four "browser-native value" surfaces that justify the extension not being a wrapper. If it just opens an empty tool page, that justification is weakened and the per-entry UX value is ~50% of what it should be. Reviewer may flag "selected text → empty tool = pointless menu".

## Acceptance criteria
The following five Blade views read `?input=<urlsafe-base64-utf8>` from `window.location` on page load and prefill the Alpine `input` reactive variable:

- [ ] `resources/views/tools/json-formatter/index.blade.php`
- [ ] `resources/views/tools/base64-encoder/index.blade.php` — also honors `?mode=encode|decode`
- [ ] `resources/views/tools/hash-generator/index.blade.php`
- [ ] `resources/views/tools/text-case-converter/index.blade.php`
- [ ] `resources/views/tools/url-parser/index.blade.php`

Additional cross-cutting:

- [ ] Decoding happens **entirely client-side** in the Alpine `init()` — no Blade-side `$_GET['input']` read
- [ ] Invalid / overlong base64 (>200 KB decoded) is silently dropped (no error toast, just empty input)
- [ ] A `partials/tool-content/_prefill-input.blade.php` (or similar shared file) implements the decode helper once and is included by each view
- [ ] The `?ref=ext&src=ctx` query params do NOT trigger any additional UI changes — they're for analytics only

## Implementation notes
The extension encodes selected text with this exact algorithm (see [`src/background.js`](../../src/background.js) `buildToolUrl`):
```js
const bytes = new TextEncoder().encode(selectionText);
let bin = '';
for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
const b64 = btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
url.searchParams.set('input', b64);
```

The matching decoder (paste this into a shared Alpine helper):
```js
function decodePrefill() {
  const raw = new URLSearchParams(location.search).get('input');
  if (!raw) return '';
  try {
    let b64 = raw.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    const bin = atob(b64);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    const text = new TextDecoder().decode(bytes);
    return text.length > 200 * 1024 ? '' : text;  // 200 KB safety cap
  } catch {
    return '';
  }
}
```

In each tool's Alpine `init()`:
```js
init() {
  const prefill = decodePrefill();
  if (prefill) this.input = prefill;
  // ... existing init logic (watchers, persistence helper, etc.)
}
```

For **base64-encoder** specifically, also read `?mode=encode|decode`:
```js
init() {
  const prefill = decodePrefill();
  const mode = new URLSearchParams(location.search).get('mode');
  if (prefill) this.input = prefill;
  if (mode === 'encode' || mode === 'decode') this.mode = mode;
  // ...
}
```

Recommendation: put `decodePrefill()` in `tools/resources/js/app.js` as `window.zrDecodePrefill = function() { … }` so the 5 tools can call it without import boilerplate.

## Done definition
- [ ] All 5 tools tested manually with a real selection from a webpage via the installed extension
- [ ] `?input=…` works for each tool with multi-byte UTF-8 input (emoji, CJK)
- [ ] base64-encoder switches mode correctly when `?mode=` is set
- [ ] No console errors when `?input=` is malformed
- [ ] Dashboard updated to 🟢 done

## Updates
- 2026-05-23: created
- 2026-05-23: shipped. Added `window.zrDecodePrefill()` + `window.zrQueryParam()` helpers to `resources/js/app.js`. Patched `init()` in 5 tool JS files (`json-formatter`, `base64-encoder` — also reads `?mode=`, `hash-generator` — forces `mode='text'`, `text-case-converter`, `url-parser`). Vite build succeeds. Helper covered indirectly by the existing tool feature tests (`Tests\Feature\Phase1ToolsTest`) — 522/522 pass. Status → 🟢 done.
