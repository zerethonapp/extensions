// Build-time configuration. The values here are the production defaults so
// loading `src/` unpacked into chrome://extensions Just Works against the live
// site. `scripts/build.mjs --env=local` rewrites this file in `dist/` to point
// at the local dev BE.

export const BASE_URL = 'https://tools.zerethon.com';
export const API_URL = `${BASE_URL}/api/internal/tools.json`;
export const IS_DEV = false;
// Zerethon IDE: "Open in IDE" on selected code. Opening a tab needs no host permission.
export const IDE_URL = 'https://ide.zerethon.com';
