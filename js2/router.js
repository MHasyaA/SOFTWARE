'use strict';

const Router = {
  pages:          {},
  currentPage:    null,
  _currentParams: {},

  // ─── Register a page module ──────────────────────────────────────────
  register(id, module) {
    this.pages[id] = module;
  },

  // ─── Navigate to a page ──────────────────────────────────────────────
  navigate(pageId, params) {
    if (!this.pages[pageId]) {
      console.warn('[Router] Unknown page:', pageId);
      pageId = 'overview';
    }

    // Cleanup previous
    if (this.currentPage && this.pages[this.currentPage]) {
      const prev = this.pages[this.currentPage];
      try {
        if (prev.unmount) prev.unmount();
        else if (prev.cleanup) prev.cleanup();
      } catch(e) { console.error(e); }
    }

    this.currentPage    = pageId;
    this._currentParams = params || {};
    window.location.hash = pageId;

    // Update sidebar active state
    document.querySelectorAll('.sidebar-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.page === pageId);
    });
    // Legacy bottom nav support (alarm page etc.)
    document.querySelectorAll('.nav-tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.page === pageId);
    });

    // Dispatch route change event for listeners
    document.dispatchEvent(new CustomEvent('routechange', { detail: { page: pageId, params } }));

    // Render
    const content = document.getElementById('pageContent');
    content.innerHTML = '';
    content.classList.remove('page-enter');
    void content.offsetWidth; // force reflow for animation
    content.classList.add('page-enter');

    const page = this.pages[pageId];
    content.innerHTML = page.render ? page.render() : '';

    // Mount (new API) or init (legacy API)
    if (page.mount) {
      try { page.mount(params); } catch(e) { console.error('[Router] mount error:', e); }
    } else if (page.init) {
      try { page.init(params); } catch(e) { console.error('[Router] init error:', e); }
    }
  },

  // ─── Init router from URL hash ────────────────────────────────────
  init() {
    const hash = window.location.hash.replace('#', '') || 'overview';
    this.navigate(hash);
    window.addEventListener('hashchange', () => {
      const h = window.location.hash.replace('#', '') || 'overview';
      if (h !== this.currentPage) this.navigate(h);
    });
  }
};
