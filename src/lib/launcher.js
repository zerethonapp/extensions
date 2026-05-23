// Shared launcher logic used by both the popup and the side panel.
// The two surfaces differ only in CSS layout — the data flow is identical.

import { REGISTRY, BUNDLED_SLUGS, CATEGORY_LABEL, filterTools } from './tools-registry.js';
import { getRecents, pushRecent } from './recents.js';
import { getFavorites, toggleFavorite } from './favorites.js';
import { BASE_URL, IS_DEV } from './config.js';

const I18N = (k) => chrome.i18n.getMessage(k) || k;

export async function mountLauncher(root) {
  const state = {
    query: '',
    recents: await getRecents(),
    favorites: await getFavorites(),
    activeIndex: 0,
  };

  const host = new URL(BASE_URL).host;
  root.innerHTML = `
    ${IS_DEV ? `<div class="zt-devbar" title="${escape(BASE_URL)}">DEV · ${escape(host)}</div>` : ''}
    <header class="zt-header">
      <input id="zt-search" type="search" placeholder="${I18N('search_placeholder')}"
             autocomplete="off" spellcheck="false" autofocus />
      <span class="zt-count" id="zt-count"></span>
    </header>
    <main class="zt-main" id="zt-main"></main>
    <footer class="zt-footer">
      <span class="zt-hint">${I18N('footer_hint')}</span>
      <a class="zt-link" id="zt-website" href="${escape(BASE_URL)}/?ref=ext" target="_blank" rel="noopener">${escape(host)}</a>
    </footer>
  `;

  const search = root.querySelector('#zt-search');
  const main = root.querySelector('#zt-main');
  const count = root.querySelector('#zt-count');

  function render() {
    const filtered = filterTools(state.query);
    count.textContent = `${filtered.length} / ${REGISTRY.length}`;
    state.activeIndex = Math.min(state.activeIndex, Math.max(filtered.length - 1, 0));

    const sections = [];

    if (!state.query && state.favorites.length) {
      sections.push(renderSection(I18N('section_favorites'),
        state.favorites.map((s) => REGISTRY.find((t) => t.slug === s)).filter(Boolean)));
    }
    if (!state.query && state.recents.length) {
      sections.push(renderSection(I18N('section_recents'),
        state.recents.map((s) => REGISTRY.find((t) => t.slug === s)).filter(Boolean)));
    }
    if (state.query) {
      sections.push(renderSection(I18N('section_results'), filtered, true));
    } else {
      const grouped = groupBy(filtered, 'category');
      for (const cat of ['developer', 'creator', 'web3']) {
        if (grouped[cat]?.length) sections.push(renderSection(CATEGORY_LABEL[cat], grouped[cat]));
      }
    }

    main.innerHTML = sections.join('') || `<p class="zt-empty">${I18N('empty_state')}</p>`;
    wireRows();
  }

  function renderSection(title, tools, flat = false) {
    if (!tools.length) return '';
    return `
      <section class="zt-section">
        <h2 class="zt-section-title">${escape(title)}</h2>
        <ul class="zt-list ${flat ? 'zt-list--flat' : ''}">
          ${tools.map((t) => renderRow(t)).join('')}
        </ul>
      </section>
    `;
  }

  function renderRow(t) {
    const fav = state.favorites.includes(t.slug);
    // Drive the badge off the runtime BUNDLED_SLUGS set, not the registry's
    // static `bundled` flag — the flag marks v0.2 candidates, but the set is
    // the source of truth for what actually opens locally today.
    const isBundled = BUNDLED_SLUGS.has(t.slug);
    const badge = isBundled
      ? `<span class="zt-badge zt-badge--bundled" title="${I18N('badge_bundled_tip')}">${I18N('badge_bundled')}</span>`
      : `<span class="zt-badge zt-badge--link" title="${I18N('badge_link_tip')}">${I18N('badge_link')}</span>`;
    return `
      <li class="zt-row" data-slug="${t.slug}">
        <button class="zt-row-main" data-action="open" data-slug="${t.slug}">
          <span class="zt-row-name">${escape(t.name)}</span>
          ${badge}
        </button>
        <button class="zt-row-fav ${fav ? 'is-on' : ''}" data-action="fav" data-slug="${t.slug}"
                aria-label="${I18N(fav ? 'aria_unfavorite' : 'aria_favorite')}" title="${I18N(fav ? 'aria_unfavorite' : 'aria_favorite')}">
          ${fav ? '★' : '☆'}
        </button>
      </li>
    `;
  }

  function wireRows() {
    main.querySelectorAll('[data-action="open"]').forEach((btn) => {
      btn.addEventListener('click', () => openTool(btn.dataset.slug));
    });
    main.querySelectorAll('[data-action="fav"]').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        state.favorites = await toggleFavorite(btn.dataset.slug);
        render();
      });
    });
  }

  async function openTool(slug) {
    const tool = REGISTRY.find((t) => t.slug === slug);
    if (!tool) return;
    state.recents = await pushRecent(slug);
    if (BUNDLED_SLUGS.has(slug)) {
      chrome.tabs.create({ url: chrome.runtime.getURL(`tools/${slug}/index.html?src=launcher`) });
    } else {
      chrome.tabs.create({ url: `${BASE_URL}/${slug}?ref=ext&src=launcher` });
    }
    if (typeof window !== 'undefined' && window.close) window.close();
  }

  search.addEventListener('input', (e) => {
    state.query = e.target.value;
    state.activeIndex = 0;
    render();
  });

  search.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const first = filterTools(state.query)[0];
      if (first) openTool(first.slug);
    }
  });

  render();
}

function groupBy(list, key) {
  return list.reduce((acc, t) => ((acc[t[key]] ||= []).push(t), acc), {});
}

function escape(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
