// The selected text, exactly as the user selected it.
//
// Chrome's contextMenus `info.selectionText` collapses line breaks and runs of
// whitespace, which destroys code (indentation, one statement per line, `#`/`//`
// comments then swallow the rest of the file). Clicking one of our menu entries
// grants `activeTab` for that tab, so we read the real selection from the clicked
// frame with chrome.scripting — once, on that click, nothing else on the page.
// Where scripts cannot run (chrome:// pages, the Web Store, the PDF viewer) we fall
// back to selectionText.

export async function readSelection(info, tab) {
  const fallback = info.selectionText || '';
  if (tab?.id == null || !chrome.scripting?.executeScript) return fallback;
  try {
    const [res] = await chrome.scripting.executeScript({
      target: { tabId: tab.id, frameIds: [info.frameId ?? 0] },
      func: pageSelection,
    });
    const text = typeof res?.result === 'string' ? res.result : '';
    return text.trim() ? text : fallback;
  } catch {
    return fallback;
  }
}

// Runs inside the page, so it must be self-contained. A selection inside a
// textarea or text input is not part of window.getSelection().
export function pageSelection() {
  const el = document.activeElement;
  const textual = el && (el.tagName === 'TEXTAREA' || (el.tagName === 'INPUT' && /^(text|search|url|email|tel)$/i.test(el.type)));
  if (textual && el.selectionStart !== el.selectionEnd) {
    return el.value.slice(el.selectionStart, el.selectionEnd);
  }
  return String(window.getSelection?.() ?? '');
}

// Line endings as \n, and the no-break spaces web code blocks use for indentation
// as plain spaces (Python rejects U+00A0; other languages misread it). Tabs, blank
// lines and all other characters are kept as they are.
export function normalizeSelection(text) {
  return String(text ?? '').replace(/\r\n?/g, '\n').replace(/ /g, ' ');
}
