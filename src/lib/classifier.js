// Smart Context Router — step 1: classify selected text, locally and deterministically.
// Pure module (no chrome.* APIs) so tests/classifier.test.mjs can run it in Node.
// No network, no AI, no logging: the text never leaves this function.
//
// Priority: URL → Email → Phone → JSON → Base64 → Source code → Text.
// The first four only ever match a whole selection (one token / one document);
// source code is scored per language and only named when the evidence is clear.

/** @typedef {'url'|'email'|'phone'|'json'|'base64'|'source_code'|'text'|'unknown'} ContentType */
/**
 * @typedef {object} DetectionResult
 * @property {ContentType} type
 * @property {number} confidence  0..1
 * @property {string} [language]  set for source_code only when confident (see LANGUAGE_MIN_SCORE)
 */

// Classification looks at most this much text; the tool still receives the whole selection.
export const SAMPLE_CHARS = 64 * 1024;
// JSON.parse on anything bigger than this would block the service worker noticeably.
const JSON_PARSE_MAX = 1024 * 1024;

const URL_RE = /^https?:\/\/[^\s<>"]+$/i;
const WWW_RE = /^www\.[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}(?::\d{2,5})?(?:[/?#][^\s<>"]*)?$/i;
const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/i;
const PHONE_CHARS_RE = /^\+?[\d\s().-]+$/;
const BASE64_RE = /^[A-Za-z0-9+/_-]+={0,2}$/;

/** @returns {DetectionResult} */
export function classify(input) {
  const text = String(input ?? '');
  const trimmed = text.trim();
  if (!trimmed) return { type: 'unknown', confidence: 0 };

  const single = !/\s/.test(trimmed);
  if (single && isUrl(trimmed)) return { type: 'url', confidence: 0.95 };
  if (single && EMAIL_RE.test(trimmed.replace(/^mailto:/i, ''))) return { type: 'email', confidence: 0.95 };

  const phone = phoneConfidence(trimmed);
  if (phone) return { type: 'phone', confidence: phone };

  if (isJson(trimmed)) return { type: 'json', confidence: 0.99 };
  if (single && isBase64(trimmed)) return { type: 'base64', confidence: 0.75 };

  const code = detectCode(trimmed.slice(0, SAMPLE_CHARS));
  if (code) return { type: 'source_code', ...code };

  return { type: 'text', confidence: 0.6 };
}

function isUrl(s) {
  if (WWW_RE.test(s)) return true;
  if (!URL_RE.test(s)) return false;
  try {
    const host = new URL(s).hostname;
    return host === 'localhost' || host.includes('.');
  } catch {
    return false;
  }
}

// A number alone is not a phone number: it needs a "+" country code, a leading 0 trunk
// prefix of local-number length (0905123456), or visible phone formatting ((415) 555-0123).
function phoneConfidence(s) {
  if (s.length > 32 || !PHONE_CHARS_RE.test(s)) return 0;
  const digits = s.replace(/\D/g, '');
  if (digits.length < 8 || digits.length > 15) return 0;
  if (/^(\d)\1+$/.test(digits)) return 0; // 00000000
  if (s.startsWith('+')) return 0.9;
  if (/^0\d{8,10}$/.test(digits)) return 0.85;
  if (/[\s().-]/.test(s) && /^(\(\d{2,4}\)|\d{2,4})[\s.-]?\d{3,4}[\s.-]?\d{3,4}$/.test(s) && digits.length >= 10) return 0.7;
  return 0;
}

// Objects and arrays only: "42", "true" and "\"x\"" parse as JSON but are not JSON documents.
function isJson(s) {
  const first = s[0];
  const last = s[s.length - 1];
  if (!((first === '{' && last === '}') || (first === '[' && last === ']'))) return false;
  if (s.length > JSON_PARSE_MAX) return false;
  try {
    const v = JSON.parse(s);
    return v !== null && typeof v === 'object';
  } catch {
    return false;
  }
}

// Long enough, correctly padded, mixed alphabet, and it decodes to readable UTF-8 —
// otherwise ordinary words (and hex hashes) would count as base64.
function isBase64(s) {
  if (s.length < 16 || s.length > 100_000 || !BASE64_RE.test(s)) return false;
  if (/^[0-9a-f]+$/i.test(s)) return false; // hex digest
  if (!/[0-9+/=_-]/.test(s) || !/[a-z]/.test(s) || !/[A-Z]/.test(s)) return false;
  let b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  if (b64.length % 4 === 1) return false;
  while (b64.length % 4) b64 += '=';
  let bytes;
  try {
    bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  } catch {
    return false;
  }
  let decoded;
  try {
    decoded = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return false;
  }
  if (!decoded.length) return false;
  const printable = decoded.replace(/[\p{C}]/gu, (c) => (c === '\n' || c === '\r' || c === '\t' ? c : '')).length;
  return printable / decoded.length >= 0.95;
}

// ---------- source code ----------

// [pattern, weight]. Weights are evidence points; a language is named only when it
// reaches LANGUAGE_MIN_SCORE and clearly beats the runner-up (LANGUAGE_MARGIN).
const SIGNALS = {
  php: [
    [/<\?php\b/, 10],
    [/\$[A-Za-z_]\w*\s*(=[^=>]|->|\[)/, 3],
    [/^\s*namespace\s+[A-Z][\w\\]*;/m, 5],
    [/^\s*use\s+[A-Z]\w*(\\\w+)+;/m, 5],
    [/\bfunction\s+\w+\s*\([^)]*\$\w+/, 3],
    [/\bpublic\s+function\s+\w+\s*\(/, 4],
    [/\becho\s+["'$]/, 2],
  ],
  python: [
    [/^\s*def\s+\w+\s*\(.*\)\s*(->\s*[^:]+)?:\s*$/m, 5],
    [/^\s*class\s+\w+(\([^)]*\))?:\s*$/m, 5],
    [/^\s*from\s+[\w.]+\s+import\s+[\w*, ]+$/m, 4],
    [/^\s*import\s+[\w.]+(\s+as\s+\w+)?$/m, 2],
    [/^\s*(elif\s.*|else|try|except(\s.*)?|finally)\s*:\s*$/m, 3],
    [/^\s*(if|for|while|with)\s.+:\s*$/m, 2],
    [/\bself\.\w+/, 2],
    [/\bprint\(/, 1],
    [/\b(None|True|False)\b/, 1],
    [/^\s*if\s+__name__\s*==\s*['"]__main__['"]\s*:/m, 6],
  ],
  javascript: [
    [/\b(const|let)\s+[\w{[][^=]*=/, 2],
    [/=>\s*[{(\w]/, 2],
    [/\bfunction\s*\w*\s*\([^$)]*\)\s*\{/, 2],
    [/\bconsole\.(log|error|warn)\(/, 3],
    [/\brequire\(\s*['"][^'"]+['"]\s*\)/, 3],
    [/^\s*import\s+[\w{}*, ]+\s+from\s+['"][^'"]+['"]/m, 3],
    [/^\s*export\s+(default|const|function|class|async)\b/m, 2],
    [/\b(document|window)\.\w+/, 2],
    [/\basync\s+function\b|\bawait\s+\w+/, 1],
    [/[!=]==/, 1],
  ],
  // Added on top of the JavaScript score: TypeScript is JavaScript plus these.
  typescript: [
    [/[\w)]\s*:\s*(string|number|boolean|any|void|unknown|never)(\[\])?\s*[,)=;{]/, 4],
    [/^\s*(export\s+)?interface\s+\w+(<[^>]*>)?\s*(extends\s+[\w, <>]+)?\{/m, 4],
    [/^\s*(export\s+)?type\s+\w+(<[^>]*>)?\s*=/m, 3],
    [/\b(private|public|protected|readonly)\s+\w+\s*[:?]/, 2],
    [/\bas\s+(const|string|number|unknown|any)\b/, 2],
    [/\w+<[\w, [\]]+>\s*\(/, 1],
  ],
  java: [
    [/\bpublic\s+static\s+void\s+main\s*\(\s*String/, 8],
    [/\bSystem\.(out|err)\.print(ln|f)?\(/, 6],
    [/^\s*import\s+(java|javax|org|com)\.[\w.]+(\.\*)?;/m, 6],
    [/^\s*package\s+[\w.]+;/m, 5],
    [/@Override\b/, 3],
    [/\b(public|private|protected)\s+(static\s+)?(final\s+)?(class|interface|enum)\s+\w+/, 2],
    [/\b(public|private|protected)\s+(static\s+)?[\w<>[\]]+\s+\w+\s*\([^)]*\)\s*(throws\s+[\w, ]+)?\{/, 2],
    [/\bString\[\]|\bArrayList<|\bHashMap</, 2],
  ],
  csharp: [
    [/^\s*using\s+System(\.[\w.]+)?;/m, 6],
    [/\bConsole\.(Write|WriteLine|ReadLine)\(/, 6],
    [/\{\s*get;\s*(private\s+|init;\s*|set;\s*)*\}/, 5],
    [/^\s*namespace\s+[\w.]+\s*(\{|;)?\s*$/m, 3],
    [/\basync\s+Task(<[\w<>, ]+>)?\s+\w+/, 4],
    [/\b(public|private|internal)\s+(static\s+|async\s+|override\s+)*(void|string|int|bool|var)\s+\w+\s*\(/, 2],
    [/^\s*\[\w+(\(.*\))?\]\s*$/m, 1],
  ],
  c: [
    [/^\s*#include\s*<\w+\.h>/m, 5],
    [/\bint\s+main\s*\(\s*(void|int\s+argc[^)]*)?\s*\)/, 3],
    [/\b(printf|scanf|fprintf|puts)\s*\(/, 2],
    [/\b(malloc|calloc|free|sizeof)\s*\(/, 2],
    [/\btypedef\s+(struct|enum|unsigned)\b/, 2],
    [/\bstruct\s+\w+\s*\{/, 1],
  ],
  // Added on top of the C score: C++ is C plus these.
  cpp: [
    [/^\s*#include\s*<(iostream|vector|string|map|unordered_map|set|algorithm|memory|cstdio|cstdlib|sstream|fstream|queue|stack)>/m, 6],
    [/\bstd::\w+/, 5],
    [/\b(cout|cin|cerr)\s*(<<|>>)/, 5],
    [/^\s*using\s+namespace\s+std\s*;/m, 6],
    [/\btemplate\s*<\s*(typename|class)\b/, 4],
    [/\b(public|private|protected):\s*$/m, 2],
  ],
  go: [
    [/^\s*package\s+\w+\s*$/m, 5],
    [/^\s*func\s+(\([^)]*\)\s*)?\w+\s*\(/m, 5],
    [/\bfmt\.(Print|Println|Printf|Sprintf|Errorf)\(/, 5],
    [/^\s*import\s+(\(|"[\w./-]+")\s*$/m, 3],
    [/\w\s*:=\s*/, 2],
    [/\b(go\s+func|chan\s+\w+|defer\s+\w+)/, 3],
    [/\bif\s+err\s*!=\s*nil\b/, 5],
  ],
  rust: [
    [/^\s*(pub\s+)?fn\s+\w+\s*(<[^>]*>)?\s*\(/m, 4],
    [/\blet\s+mut\s+\w+/, 5],
    [/\b(println|print|vec|format|panic|eprintln)!\s*[([]/, 6],
    [/^\s*impl(<[^>]*>)?\s+[\w:<>]+(\s+for\s+\w+)?\s*\{/m, 4],
    [/^\s*use\s+(std|crate|super|self)(::[\w{}*, ]+)+;/m, 4],
    [/^\s*pub\s+(struct|enum|mod|trait|fn)\b/m, 4],
    [/&mut\s+\w+|&str\b|\bOption<|\bResult<|\bSome\(|\bOk\(/, 3],
    [/\bmatch\s+\w+\s*\{/, 2],
  ],
  sql: [
    // Upper-case statement keywords are strong evidence; lower case only with SQL structure
    // (a column list before FROM), so prose like "Select a plan from the list" stays text.
    [/^\s*(SELECT\s[\s\S]+?\sFROM\s|INSERT\s+INTO\s|UPDATE\s+\w+\s+SET\s|DELETE\s+FROM\s|CREATE\s+(TABLE|INDEX|VIEW|DATABASE|UNIQUE\s+INDEX)\s|ALTER\s+TABLE\s|DROP\s+(TABLE|INDEX|VIEW)\s|WITH\s+\w+\s+AS\s*\()/, 6],
    [/^\s*select\s+(\*|[\w.]+(\s*,\s*[\w.]+)*)\s+from\s+[\w.]+/i, 4],
    [/^\s*(insert\s+into\s+[\w.]+\s*\(|delete\s+from\s+[\w.]+\s+where\s|create\s+table\s+[\w.]+\s*\()/i, 4],
    [/\bWHERE\s+[\w.]+\s*(=|<>|!=|<|>|LIKE|IN|IS)\s*/i, 2],
    [/\b(INNER|LEFT|RIGHT|FULL)?\s*JOIN\s+\w+\s+(\w+\s+)?ON\b/i, 3],
    [/\b(GROUP|ORDER)\s+BY\b/i, 2],
    [/\bVALUES\s*\(/i, 2],
    [/\b(PRIMARY\s+KEY|FOREIGN\s+KEY|NOT\s+NULL|VARCHAR\(\d+\)|INTEGER|AUTO_INCREMENT)\b/i, 2],
  ],
  html: [
    [/^\s*<!DOCTYPE\s+html/i, 10],
    [/^\s*<(html|head|body|div|span|p|a|ul|ol|li|table|tr|td|section|article|header|footer|nav|main|form|input|button|img|h[1-6]|script|style|meta|link|template)\b[^>]*>/i, 4],
    [/<\/(html|head|body|div|span|p|a|ul|ol|li|table|tr|td|section|article|header|footer|nav|main|form|button|h[1-6]|script|style)>/i, 3],
    [/\s(class|id|href|src|style|alt|type|name)="[^"]*"/, 1],
  ],
  css: [
    [/(^|\})\s*[.#:@\w[\]="'*>+~, -]+\{\s*[\w-]+\s*:\s*[^;{}]+;/m, 5],
    [/^\s*@(media|import|keyframes|font-face|supports|layer)\b/m, 4],
    [/\b(color|margin|padding|display|font-size|font-family|background(-color)?|border(-radius)?|width|height)\s*:\s*[^;{}]+;/, 2],
    [/:\s*-?\d+(\.\d+)?(px|rem|em|vh|vw|%)\s*[;}]/, 2],
  ],
  bash: [
    [/^#!\s*\/(usr\/)?bin\/(env\s+)?(ba|z)?sh\b/, 10],
    [/^\s*(sudo|apt(-get)?|brew|npm|npx|yarn|pnpm|pip3?|git|cd|ls|export|chmod|chown|curl|wget|docker|kubectl|mkdir|rm|cp|mv|source)\s+\S/m, 3],
    [/^\s*(if|while|for)\s+.*;\s*(then|do)\s*$/m, 4],
    [/^\s*(fi|done|esac)\s*$/m, 3],
    [/\[\[\s.+\s\]\]/, 3],
    [/\|\s*(grep|awk|sed|xargs|sort|uniq|wc|head|tail)\b/, 3],
    [/^\s*\w+=("[^"]*"|'[^']*'|\S+)\s*$/m, 1],
    [/\$\{?\w+\}?/, 1],
  ],
};

// TypeScript and C++ extend JavaScript and C: their score includes the base language's.
const EXTENDS = { typescript: 'javascript', cpp: 'c' };

export const LANGUAGE_MIN_SCORE = 6;
const LANGUAGE_MARGIN = 1.5;
// Below this nothing looks like code; between it and LANGUAGE_MIN_SCORE it is code of an unknown language.
const CODE_MIN_SCORE = 3;

// Evidence points per language. A child language (TypeScript, C++) with any evidence of its
// own takes over its base's points; without its own evidence it scores 0.
export function scoreLanguages(text) {
  const scores = {};
  for (const [lang, signals] of Object.entries(SIGNALS)) {
    scores[lang] = signals.reduce((sum, [re, w]) => (re.test(text) ? sum + w : sum), 0);
  }
  for (const [child, base] of Object.entries(EXTENDS)) {
    if (scores[child] > 0) {
      scores[child] += scores[base];
      scores[base] = 0;
    }
  }
  return scores;
}

function detectCode(text) {
  const scores = scoreLanguages(text);
  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [best, bestScore] = ranked[0];
  const second = ranked[1][1];

  if (bestScore >= LANGUAGE_MIN_SCORE && bestScore >= second * LANGUAGE_MARGIN) {
    return { confidence: Math.min(0.95, 0.5 + bestScore / 30), language: best };
  }
  if (bestScore >= CODE_MIN_SCORE || looksStructured(text)) {
    return { confidence: 0.4 };
  }
  return null;
}

// Code-shaped without a recognizable language: several lines, most ending in ; { } or ),
// and a high density of code punctuation.
function looksStructured(text) {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length < 3) return false;
  const codeLines = lines.filter((l) => /[;{}()]$/.test(l)).length;
  const punct = (text.match(/[{}()[\];=<>]/g) || []).length;
  return codeLines / lines.length >= 0.6 && punct / text.length >= 0.05;
}
