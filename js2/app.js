'use strict';

// ─── Global UI Utilities ─────────────────────────────────────────────────────
const UI = {
  toast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const icons = { success: '✓', error: '✕', info: 'ℹ', warn: '⚠' };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span style="font-weight:700;font-size:15px">${icons[type]||'ℹ'}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), duration + 300);
  },

  confirm(title, body, onConfirm, confirmLabel = 'Konfirmasi', danger = false) {
    const container = document.getElementById('modalContainer');
    if (!container) return;
    container.innerHTML = `
      <div class="modal-overlay" id="activeModal">
        <div class="modal-box">
          <div class="modal-title">${title}</div>
          <div class="modal-body">${body}</div>
          <div class="modal-footer">
            <button class="btn btn-secondary btn-sm" id="modalCancel">Batal</button>
            <button class="btn ${danger ? 'btn-danger' : 'btn-primary'} btn-sm" id="modalConfirm">${confirmLabel}</button>
          </div>
        </div>
      </div>
    `;
    document.getElementById('modalCancel').onclick  = () => { container.innerHTML = ''; };
    document.getElementById('modalConfirm').onclick = () => { 
      onConfirm(); 
      container.innerHTML = ''; 
    };
    document.getElementById('activeModal').onclick  = e => { if (e.target.id === 'activeModal') container.innerHTML = ''; };
  },

  fmt(val, decimals = 1, fallback = '—') {
    const n = parseFloat(val);
    return isNaN(n) ? fallback : n.toFixed(decimals);
  },

  fmtTime(isoStr) {
    if (!isoStr) return '—';
    try { return new Date(isoStr).toLocaleString('id-ID', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false }); }
    catch { return isoStr; }
  }
};

// ─── Theme Manager ────────────────────────────────────────────────────────────
const ThemeManager = {
  STORAGE_KEY: 'bmc_theme',

  init() {
    const saved = localStorage.getItem(this.STORAGE_KEY) || 'dark';
    this.apply(saved, false);

    const btn = document.getElementById('themeToggle');
    if (btn) btn.addEventListener('click', () => this.toggle());
  },

  toggle() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    this.apply(current === 'dark' ? 'light' : 'dark', true);
  },

  apply(theme, save = true) {
    document.documentElement.setAttribute('data-theme', theme);
    if (save) localStorage.setItem(this.STORAGE_KEY, theme);
    this._updateBtn(theme);
    this._updateChartDefaults(theme);
  },

  _updateBtn(theme) {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    const isDark = theme === 'dark';
    btn.textContent = isDark ? '☀️' : '🌙';
    btn.title = isDark ? 'Mode Siang' : 'Mode Malam';
  },

  _updateChartDefaults(theme) {
    if (!window.Chart) return;
    const isDark = theme !== 'light';
    Chart.defaults.color       = isDark ? '#52525b' : '#6b7280';
    Chart.defaults.borderColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';

    // Re-render any active chart by dispatching a custom event
    document.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
  },

  get isDark() {
    return (document.documentElement.getAttribute('data-theme') || 'dark') === 'dark';
  }
};

// ─── Sidebar Manager ──────────────────────────────────────────────────────────
const SidebarManager = {
  _isOpen: false,

  init() {
    const toggle  = document.getElementById('sidebarToggle');
    const overlay = document.getElementById('sidebarOverlay');
    const sidebar = document.getElementById('sidebar');

    if (toggle)  toggle.addEventListener('click',  () => this.toggleMobile());
    if (overlay) overlay.addEventListener('click',  () => this.closeMobile());

    // Sidebar nav item clicks
    document.querySelectorAll('.sidebar-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const page = btn.dataset.page;
        if (page) {
          Router.navigate(page);
          this.closeMobile();
        }
      });
    });
  },

  toggleMobile() {
    this._isOpen ? this.closeMobile() : this.openMobile();
  },

  openMobile() {
    this._isOpen = true;
    document.getElementById('sidebar')?.classList.add('mobile-open');
    document.getElementById('sidebarOverlay')?.classList.add('visible');
  },

  closeMobile() {
    this._isOpen = false;
    document.getElementById('sidebar')?.classList.remove('mobile-open');
    document.getElementById('sidebarOverlay')?.classList.remove('visible');
  },

  // Highlight the active nav item
  setActive(pageId) {
    document.querySelectorAll('.sidebar-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.page === pageId);
    });
  },

  // Update alarm badge in sidebar
  updateAlarmBadge(count) {
    const badge = document.getElementById('alarmNavBadge');
    if (!badge) return;
    if (count > 0) {
      badge.textContent = count;
      badge.hidden = false;
    } else {
      badge.hidden = true;
    }
  }
};

// ─── App Init ─────────────────────────────────────────────────────────────────
const App = {
  clockTimer: null,

  init() {
    const session = AUTH.requireAuth();
    if (!session) return;

    // Theme
    ThemeManager.init();
    
    // Config Metadata
    if (typeof CONFIG.loadLocalOverrides === 'function') {
      CONFIG.loadLocalOverrides();
    }

    // Topbar user info
    const userEl = document.getElementById('topbarUserName');
    const roleEl = document.getElementById('topbarRoleBadge');
    if (userEl) userEl.textContent = session.name;
    if (roleEl) roleEl.innerHTML  = AUTH.getRoleBadgeHtml();

    // Set ChartJS defaults
    ThemeManager._updateChartDefaults(localStorage.getItem('bmc_theme') || 'dark');

    // Clock
    this._startClock();

    // Sidebar
    SidebarManager.init();

    // Register pages
    Router.register('overview', OverviewPage);
    Router.register('detail',   DetailPage);
    Router.register('trend',    TrendPage);
    Router.register('cockpit',  CockpitPage);
    Router.register('alarm',    AlarmPage);
    Router.register('settings', SettingsPage);

    // Update sidebar active state on navigation
    document.addEventListener('routechange', e => {
      SidebarManager.setActive(e.detail?.page || 'overview');
    });

    // Mode strip + alarm badge reactivity
    STATE.on('update', () => {
      this._updateModeStrip();
      const activeAlarms = STATE.alarmHistory.filter(a => a.status === 'active').length;
      SidebarManager.updateAlarmBadge(activeAlarms);
    });

    // Init router (fires initial route)
    Router.init();

    // Connect WS
    WSManager.connect();
  },

  _startClock() {
    const tick = () => {
      const now     = new Date();
      const timeStr = now.toLocaleTimeString('id-ID', { hour12:false, hour:'2-digit', minute:'2-digit', second:'2-digit' });
      const dateStr = now.toLocaleDateString('id-ID', { weekday:'long', day:'2-digit', month:'long', year:'numeric' });
      const c = document.getElementById('clock');
      const d = document.getElementById('dateDisplay');
      if (c) c.textContent = timeStr;
      if (d) d.textContent = dateStr;
    };
    tick();
    this.clockTimer = setInterval(tick, 1000);
  },

  _updateModeStrip() {
    const el   = document.getElementById('modeBadge');
    const dot  = document.getElementById('conditionDot');
    const lbl  = document.getElementById('conditionLabel');
    if (!el) return;
    const { system_mode, condition_mode } = STATE.system;
    const isAuto = system_mode === 'AUTO';
    el.textContent  = system_mode;
    el.className    = `mode-badge ${isAuto ? 'mode-auto' : 'mode-manual'}`;
    if (dot) dot.className   = `condition-dot ${condition_mode ? 'condition-on' : 'condition-off'}`;
    if (lbl) lbl.textContent = `COND ${condition_mode ? 'ON' : 'OFF'}`;
  }
};

// ─── Global helpers exposed to page modules ───────────────────────────────────
function showToast(message, type = 'info') {
  UI.toast(message, type);
}

document.addEventListener('DOMContentLoaded', () => App.init());

