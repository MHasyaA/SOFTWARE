'use strict';

const AUTH = {
  SESSION_KEY: 'bmc_session',

  // ─── Login ────────────────────────────────────────────────────────────
  login(username, password) {
    const user = CONFIG.USERS.find(
      u => u.username === username && u.password === password
    );
    if (!user) return { success: false, message: 'Username atau password salah.' };

    const session = {
      username:   user.username,
      name:       user.name,
      role:       user.role,
      token:      `bmc_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
      loginTime:  new Date().toISOString()
    };
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    return { success: true, session };
  },

  // ─── Logout ───────────────────────────────────────────────────────────
  logout() {
    localStorage.removeItem(this.SESSION_KEY);
    window.location.href = 'login.html';
  },

  // ─── Get current session ──────────────────────────────────────────────
  getSession() {
    try {
      const raw = localStorage.getItem(this.SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  // ─── Check if logged in, redirect if not ─────────────────────────────
  requireAuth() {
    const session = this.getSession();
    if (!session) {
      window.location.href = 'login.html';
      return null;
    }
    return session;
  },

  // ─── Get role config for current user ────────────────────────────────
  getRoleConfig() {
    const session = this.getSession();
    if (!session) return CONFIG.ROLES.viewer;
    return CONFIG.ROLES[session.role] || CONFIG.ROLES.viewer;
  },

  // ─── Permission helpers ───────────────────────────────────────────────
  canControl()  { return this.getRoleConfig().canControl;  },
  canAck()      { return this.getRoleConfig().canAck;      },
  canSettings() { return this.getRoleConfig().canSettings; },

  // ─── Role badge HTML ──────────────────────────────────────────────────
  getRoleBadgeHtml() {
    const session = this.getSession();
    if (!session) return '';
    const role = CONFIG.ROLES[session.role];
    return `<span class="role-badge" style="background:${role.color}20;color:${role.color};border-color:${role.color}40">${role.label}</span>`;
  }
};
