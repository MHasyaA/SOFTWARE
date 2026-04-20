'use strict';

const CONFIG = {
  WS_URL: 'ws://localhost:1880/ws/dashboard',
  WS_RECONNECT_INTERVAL: 3000,
  WS_MAX_RECONNECTS: 20,

  APP_NAME: 'Air Compressor Management System',
  CLIENT_NAME: 'PT. Braja Mukti Cakra',
  VERSION: '1.0.0',

  // ─── Hardcoded users (fase 1) ───────────────────────────────────────────────
  USERS: [
    { username: 'admin',    password: 'admin123',  role: 'admin',    name: 'Administrator' },
    { username: 'operator', password: 'operator1', role: 'operator', name: 'Operator'      },
    { username: 'viewer',   password: 'viewer1',   role: 'viewer',   name: 'Viewer'        }
  ],

  // ─── Role permissions ────────────────────────────────────────────────────────
  ROLES: {
    admin:    { label: 'ADMIN',    color: '#f0883e', canControl: true,  canAck: true,  canSettings: true  },
    operator: { label: 'OPERATOR', color: '#58a6ff', canControl: true,  canAck: true,  canSettings: false },
    viewer:   { label: 'VIEWER',   color: '#3fb950', canControl: false, canAck: false, canSettings: false }
  },

  // ─── Navigation pages ─────────────────────────────────────────────────────
  NAV_PAGES: [
    { id: 'overview', label: 'Overview' },
    { id: 'detail',   label: 'Detail'   },
    { id: 'trend',    label: 'Trend'    },
    { id: 'cockpit',  label: 'Cockpit'  },
    { id: 'alarm',    label: 'Alarm'    },
    { id: 'settings', label: 'Settings' }
  ],

  // ─── Alarm type registry ─────────────────────────────────────────────────
  ALARM_TYPES: {
    HIGH_TEMP:     { label: 'High Temperature', priority: 'HIGH',   priorityColor: '#f85149' },
    HIGH_CURRENT:  { label: 'High Current',     priority: 'HIGH',   priorityColor: '#f85149' },
    HIGH_PRESSURE: { label: 'High Pressure',    priority: 'HIGH',   priorityColor: '#f85149' },
    LOW_PRESSURE:  { label: 'Low Pressure',     priority: 'MEDIUM', priorityColor: '#d29922' },
    OVERLOAD:      { label: 'Motor Overload',   priority: 'HIGH',   priorityColor: '#f85149' },
    PHASE_FAULT:   { label: 'Phase Fault',      priority: 'HIGH',   priorityColor: '#f85149' },
    COMM_FAIL:     { label: 'Comm Fail',        priority: 'LOW',    priorityColor: '#8b949e' }
  },

  // ─── Trend mock data config ──────────────────────────────────────────────
  TREND_METRICS: ['pressure', 'voltage', 'current', 'power'],
  TREND_RANGES:  ['1d', '7d', '30d'],
  TREND_RANGE_LABELS: { '1d': 'Last 24h', '7d': 'Last 7 Days', '30d': 'Last 30 Days' },

  // ─── Machine metadata (display name, area, icon type) ───────────────────
  MACHINES: {
    'COMP-01': { name: 'COMPRESSOR - 1', area: 'Factory Area',    type: 'boge',   brand: 'Boge' },
    'COMP-02': { name: 'COMPRESSOR - 2', area: 'Factory Area',    type: 'boge',   brand: 'Boge' },
    'COMP-03': { name: 'COMPRESSOR - 3', area: 'Factory Area',    type: 'atlas',  brand: 'Atlas Copco' },
    'COMP-04': { name: 'COMPRESSOR - 4', area: 'Factory Area',    type: 'atlas',  brand: 'Atlas Copco' },
    'COMP-05': { name: 'COMPRESSOR - 5', area: 'Quality Area',    type: 'boge',   brand: 'Generic' },
    'COMP-06': { name: 'COMPRESSOR - 6', area: 'Quality Area',    type: 'atlas',  brand: 'Generic' },
    'COMP-07': { name: 'COMPRESSOR - 7', area: 'Brake Assy Area', type: 'boge',   brand: 'Generic' }
  },

  loadLocalOverrides() {
    try {
      const overrides = JSON.parse(localStorage.getItem('bmc_machine_meta') || '{}');
      for (const id in overrides) {
        if (this.MACHINES[id]) {
          this.MACHINES[id] = { ...this.MACHINES[id], ...overrides[id] };
        }
      }
    } catch(e) {}
  },

  saveLocalOverrides(id, name, area) {
    if (!this.MACHINES[id]) return;
    this.MACHINES[id].name = name;
    this.MACHINES[id].area = area;
    
    let overrides = {};
    try { overrides = JSON.parse(localStorage.getItem('bmc_machine_meta') || '{}'); } catch(e) {}
    
    overrides[id] = { name, area };
    localStorage.setItem('bmc_machine_meta', JSON.stringify(overrides));
  },

  // ─── Scheduling areas & machine mapping ──────────────────────────────────
  SCHEDULE_AREAS: [
    {
      id: 'factory',
      label: 'Factory Area',
      units: ['COMP-01', 'COMP-02', 'COMP-03', 'COMP-04']
    },
    {
      id: 'quality',
      label: 'Quality Area',
      units: ['COMP-06', 'COMP-07']
    },
    {
      id: 'brake',
      label: 'Brake Assy Area',
      units: ['COMP-05']
    }
  ],

  // ─── OEE / Analytics dummy data ──────────────────────────────────────────
  OEE_DUMMY: 88,
  SPC_DUMMY: 0.12,
  SAVINGS_DUMMY: 2450000
};
