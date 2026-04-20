'use strict';
/* ═══════════════════════════════════════════════════════
   OVERVIEW PAGE — Figma-aligned design
   KPI row: OEE gauge, SPC, Savings, Schedule
   Machine grid: status ring + SVG icon + metrics
═══════════════════════════════════════════════════════ */

// ─── Machine SVG Icons ────────────────────────────────
var MACHINE_ICONS = {

  'atlas': `<svg viewBox="0 0 80 62" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="18" width="60" height="28" rx="4" fill="var(--bg-surface)" stroke="var(--border-hover)" stroke-width="1.2"/>
    <rect x="6" y="9" width="38" height="11" rx="2.5" fill="var(--bg-input)" stroke="var(--border)" stroke-width="1"/>
    <line x1="12" y1="10" x2="12" y2="19" stroke="var(--border-hover)" stroke-width="1"/>
    <line x1="17" y1="10" x2="17" y2="19" stroke="var(--border-hover)" stroke-width="1"/>
    <line x1="22" y1="10" x2="22" y2="19" stroke="var(--border-hover)" stroke-width="1"/>
    <line x1="27" y1="10" x2="27" y2="19" stroke="var(--border-hover)" stroke-width="1"/>
    <line x1="32" y1="10" x2="32" y2="19" stroke="var(--border-hover)" stroke-width="1"/>
    <line x1="37" y1="10" x2="37" y2="19" stroke="var(--border-hover)" stroke-width="1"/>
    <rect x="48" y="20" width="11" height="20" rx="2" fill="var(--bg-input)" stroke="var(--border)" stroke-width="1"/>
    <circle cx="51.5" cy="25" r="2.5" fill="var(--accent-cyan)" opacity="0.85"/>
    <rect x="49" y="30" width="8" height="1.5" rx="1" fill="var(--accent-cyan)" opacity="0.4"/>
    <rect x="49" y="33" width="6" height="1.5" rx="1" fill="var(--accent-cyan)" opacity="0.25"/>
    <rect x="62" y="22" width="10" height="6" rx="2" fill="var(--bg-input)" stroke="var(--border)" stroke-width="1"/>
    <rect x="0" y="25" width="4" height="5" rx="1.5" fill="var(--bg-input)" stroke="var(--border)" stroke-width="1"/>
    <rect x="8" y="46" width="50" height="4" rx="2" fill="var(--bg-input)" opacity="0.8"/>
    <circle cx="16" cy="53" r="4.5" fill="none" stroke="var(--border-hover)" stroke-width="1.8"/>
    <circle cx="16" cy="53" r="1.5" fill="var(--text-muted)"/>
    <circle cx="52" cy="53" r="4.5" fill="none" stroke="var(--border-hover)" stroke-width="1.8"/>
    <circle cx="52" cy="53" r="1.5" fill="var(--text-muted)"/>
  </svg>`,

  'boge': `<svg viewBox="0 0 70 65" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="16" width="50" height="34" rx="5" fill="var(--bg-surface)" stroke="var(--border-hover)" stroke-width="1.2"/>
    <rect x="5" y="8" width="50" height="10" rx="3" fill="var(--bg-input)" stroke="var(--border)" stroke-width="1"/>
    <line x1="12" y1="9" x2="12" y2="17" stroke="var(--border-hover)" stroke-width="0.9"/>
    <line x1="18" y1="9" x2="18" y2="17" stroke="var(--border-hover)" stroke-width="0.9"/>
    <line x1="24" y1="9" x2="24" y2="17" stroke="var(--border-hover)" stroke-width="0.9"/>
    <line x1="30" y1="9" x2="30" y2="17" stroke="var(--border-hover)" stroke-width="0.9"/>
    <line x1="36" y1="9" x2="36" y2="17" stroke="var(--border-hover)" stroke-width="0.9"/>
    <line x1="42" y1="9" x2="42" y2="17" stroke="var(--border-hover)" stroke-width="0.9"/>
    <line x1="48" y1="9" x2="48" y2="17" stroke="var(--border-hover)" stroke-width="0.9"/>
    <rect x="8" y="20" width="22" height="22" rx="3" fill="var(--bg-input)" stroke="var(--border)" stroke-width="1"/>
    <circle cx="19" cy="31" r="7" fill="none" stroke="var(--accent-cyan)" stroke-width="2" opacity="0.55"/>
    <circle cx="19" cy="31" r="3" fill="var(--accent-cyan)" opacity="0.25"/>
    <rect x="34" y="20" width="17" height="22" rx="2" fill="var(--bg-input)" stroke="var(--border)" stroke-width="1"/>
    <circle cx="37.5" cy="25" r="2" fill="var(--accent-green)" opacity="0.75"/>
    <rect x="36" y="31" width="11" height="1.5" rx="1" fill="var(--accent-cyan)" opacity="0.4"/>
    <rect x="36" y="34" width="8" height="1.5" rx="1" fill="var(--accent-cyan)" opacity="0.25"/>
    <rect x="36" y="37" width="10" height="1.5" rx="1" fill="var(--border-hover)" opacity="0.5"/>
    <rect x="11" y="50" width="40" height="4" rx="2" fill="var(--bg-input)" opacity="0.8"/>
    <circle cx="20" cy="57" r="4" fill="none" stroke="var(--border-hover)" stroke-width="1.8"/>
    <circle cx="20" cy="57" r="1.5" fill="var(--text-muted)"/>
    <circle cx="46" cy="57" r="4" fill="none" stroke="var(--border-hover)" stroke-width="1.8"/>
    <circle cx="46" cy="57" r="1.5" fill="var(--text-muted)"/>
  </svg>`,

  'piston': `<svg viewBox="0 0 75 70" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="36" width="54" height="22" rx="4" fill="var(--bg-surface)" stroke="var(--border-hover)" stroke-width="1.2"/>
    <circle cx="27" cy="30" r="13" fill="var(--bg-input)" stroke="var(--border-hover)" stroke-width="1.2"/>
    <circle cx="27" cy="30" r="8" fill="var(--bg-surface)" stroke="var(--border)" stroke-width="1"/>
    <circle cx="27" cy="30" r="3" fill="var(--text-muted)" opacity="0.5"/>
    <circle cx="50" cy="30" r="10" fill="var(--bg-input)" stroke="var(--border-hover)" stroke-width="1.2"/>
    <circle cx="50" cy="30" r="6" fill="var(--bg-surface)" stroke="var(--border)" stroke-width="1"/>
    <circle cx="50" cy="30" r="2.5" fill="var(--text-muted)" opacity="0.45"/>
    <rect x="24" y="41" width="6" height="10" rx="1" fill="var(--bg-input)" stroke="var(--border)" stroke-width="0.8"/>
    <rect x="47" y="41" width="6" height="10" rx="1" fill="var(--bg-input)" stroke="var(--border)" stroke-width="0.8"/>
    <rect x="30" y="44" width="17" height="5" rx="1" fill="var(--bg-input)" opacity="0.55"/>
    <circle cx="38.5" cy="50" r="2" fill="var(--accent-cyan)" opacity="0.55"/>
    <rect x="0" y="43" width="12" height="6" rx="2" fill="var(--bg-input)" stroke="var(--border)" stroke-width="0.8"/>
    <rect x="63" y="43" width="12" height="6" rx="2" fill="var(--bg-input)" stroke="var(--border)" stroke-width="0.8"/>
    <rect x="12" y="58" width="51" height="4" rx="2" fill="var(--bg-input)" opacity="0.8"/>
    <circle cx="22" cy="64" r="3.5" fill="none" stroke="var(--border-hover)" stroke-width="1.5"/>
    <circle cx="52" cy="64" r="3.5" fill="none" stroke="var(--border-hover)" stroke-width="1.5"/>
  </svg>`,

  'airtank': `<svg viewBox="0 0 48 82" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="24" cy="16" rx="16" ry="8" fill="var(--bg-input)" stroke="var(--border-hover)" stroke-width="1.2"/>
    <rect x="8" y="16" width="32" height="40" fill="var(--bg-surface)" stroke="var(--border-hover)" stroke-width="1.2"/>
    <ellipse cx="24" cy="56" rx="16" ry="8" fill="var(--bg-input)" stroke="var(--border-hover)" stroke-width="1.2"/>
    <line x1="9" y1="26" x2="39" y2="26" stroke="var(--border)" stroke-width="0.7" opacity="0.5"/>
    <line x1="9" y1="36" x2="39" y2="36" stroke="var(--border)" stroke-width="0.7" opacity="0.5"/>
    <line x1="9" y1="46" x2="39" y2="46" stroke="var(--border)" stroke-width="0.7" opacity="0.5"/>
    <rect x="21" y="8" width="6" height="8" rx="1.5" fill="var(--accent-cyan)" opacity="0.65"/>
    <circle cx="24" cy="7" r="3" fill="var(--bg-surface)" stroke="var(--accent-cyan)" stroke-width="1.5" opacity="0.75"/>
    <line x1="15" y1="64" x2="12" y2="75" stroke="var(--border-hover)" stroke-width="2" stroke-linecap="round"/>
    <line x1="33" y1="64" x2="36" y2="75" stroke="var(--border-hover)" stroke-width="2" stroke-linecap="round"/>
    <rect x="8" y="73" width="8" height="4" rx="2" fill="var(--border-hover)" opacity="0.8"/>
    <rect x="32" y="73" width="8" height="4" rx="2" fill="var(--border-hover)" opacity="0.8"/>
  </svg>`
};

// ─── OEE Semi-circle Gauge ────────────────────────────
function buildOEEGauge(pct) {
  const R = 52, CX = 60, CY = 60;
  const TAU = Math.PI;
  // Semi-circle starts at 180° (left) sweeps to 0° (right)
  const circumference = Math.PI * R;
  const offset = circumference * (1 - pct / 100);

  return `
  <svg class="oee-gauge-svg" viewBox="0 0 120 70" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Track -->
    <path d="M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}"
      stroke="var(--bg-surface)" stroke-width="10" fill="none" stroke-linecap="round"/>
    <!-- Progress -->
    <path d="M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}"
      stroke="var(--accent-cyan)" stroke-width="10" fill="none" stroke-linecap="round"
      stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
      style="filter:drop-shadow(0 0 6px var(--accent-cyan-glow))"/>
    <!-- Value -->
    <text x="${CX}" y="${CY - 4}" text-anchor="middle" font-size="22" font-weight="800"
      fill="var(--text-primary)" font-family="Inter,-apple-system,sans-serif">${pct}%</text>
    <text x="${CX}" y="${CY + 10}" text-anchor="middle" font-size="8" font-weight="700"
      fill="var(--text-muted)" font-family="Inter,-apple-system,sans-serif" letter-spacing="1">OEE</text>
  </svg>`;
}

// ─── Savings Mini Bar Chart ───────────────────────────
function buildSavingsBars() {
  const heights = [55, 70, 45, 80, 60, 90, 100];
  const colors  = ['0.4','0.5','0.35','0.6','0.45','0.7','1'];
  return heights.map((h, i) =>
    `<div class="savings-bar${i === 6 ? ' highlight' : ''}" style="height:${h}%;opacity:${colors[i]}"></div>`
  ).join('');
}

// ─── Machine Ring Builder ─────────────────────────────
function buildMachineRing(status, isAirtank) {
  const grn = 'var(--accent-green)';
  const red = 'var(--accent-red)';
  const gray = 'var(--text-muted)';
  const cyan = 'var(--accent-cyan)';

  let color, glow;
  if (status === 'RUNNING')      { color = grn;  glow = 'var(--accent-green-glow)'; }
  else if (status === 'ALARM')   { color = red;  glow = 'var(--accent-red-glow)'; }
  else if (isAirtank)            { color = cyan; glow = 'var(--accent-cyan-glow)'; }
  else                           { color = gray; glow = 'none'; }

  const R = 46, CX = 54, CY = 54;
  const circ = 2 * Math.PI * R;

  return `<svg class="machine-ring-svg" viewBox="0 0 108 108" fill="none">
    <circle cx="${CX}" cy="${CY}" r="${R}" stroke="var(--bg-surface)" stroke-width="8" fill="none"/>
    <circle cx="${CX}" cy="${CY}" r="${R}" stroke="${color}" stroke-width="8" fill="none"
      stroke-linecap="round"
      transform="rotate(-90 ${CX} ${CY})"
      stroke-dasharray="${circ}" stroke-dashoffset="0"
      ${glow !== 'none' ? `style="filter:drop-shadow(0 0 6px ${glow})"` : ''}/>
  </svg>`;
}

// ─── Normalize unit from downlink ────────────────────
// Downlink sends status as object; normalize to string
function normalizeUnit(raw) {
  if (!raw) return { id: '?', status: 'STOP', pressure: null, power: 0, running_hour: 0, energy_today: 0 };
  // If status is already a string
  if (typeof raw.status === 'string') {
    const m = raw.metrics || {};
    return {
      id:           raw.id,
      status:       raw.status,
      pressure:     raw.pressure      ?? (parseFloat(m.pressure)      || null),
      power:        raw.power         ?? (parseFloat(m.power)         || 0),
      running_hour: raw.running_hour  ?? (Math.round(parseFloat(m.running_hours)) || 0),
      energy_today: raw.energy_today  ?? (parseFloat(m.energy)        || 0)
    };
  }
  // Status is an object {is_running, is_alarm, alarm_list}
  const s = raw.status || {};
  let status;
  if (s.is_alarm)    status = 'ALARM';
  else if (s.is_running) status = 'RUNNING';
  else                   status = 'STOP';
  const m = raw.metrics || {};
  return {
    id:           raw.id,
    status,
    pressure:     parseFloat(m.pressure)               || null,
    power:        parseFloat(m.power)                  || 0,
    running_hour: Math.round(parseFloat(m.running_hours)) || 0,
    energy_today: parseFloat(m.energy)                 || 0
  };
}

// ─── Machine Card Builder ─────────────────────────────
function buildMachineCard(rawUnit) {
  const unit = normalizeUnit(rawUnit);
  const meta    = CONFIG.MACHINES[unit.id] || { name: unit.id, area: '—', type: 'boge', brand: '—' };
  const status  = unit.status;
  const isAirtank = meta.type === 'airtank';

  let statusClass, statusLabel;
  if (status === 'RUNNING')      { statusClass = 'mstatus-running'; statusLabel = 'RUNNING'; }
  else if (status === 'ALARM')   { statusClass = 'mstatus-alarm';   statusLabel = 'ALARM'; }
  else if (status === 'STANDBY') { statusClass = 'mstatus-standby'; statusLabel = 'STANDBY'; }
  else if (isAirtank)            { statusClass = 'mstatus-valve';   statusLabel = 'VALVE ON'; }
  else                           { statusClass = 'mstatus-stop';    statusLabel = 'STOP'; }

  const icon = MACHINE_ICONS[meta.type] || MACHINE_ICONS['boge'];

  const metrics = isAirtank
    ? `<div class="machine-metric machine-metric-pressure">
         <span class="machine-metric-label">Pressure</span>
         <span class="machine-metric-value">${unit.pressure ?? '—'} <span class="machine-metric-unit">Bar</span></span>
       </div>`
    : `<div class="machine-metric">
         <span class="machine-metric-label">Run Hour</span>
         <span class="machine-metric-value">${unit.running_hour ?? '—'}</span>
         <span class="machine-metric-unit">Hour</span>
       </div>
       <div class="machine-metric">
         <span class="machine-metric-label">Power</span>
         <span class="machine-metric-value">${unit.power != null ? unit.power.toFixed(1) : '—'}</span>
         <span class="machine-metric-unit">kW</span>
       </div>`;

  return `
  <div class="machine-card"
       data-unit-id="${unit.id}"
       onclick="Router.navigate('detail', {unit:'${unit.id}'})">
    <div class="machine-card-header" style="justify-content:center; flex-direction:column; align-items:center; gap:8px; padding-bottom:8px">
      <div class="machine-card-info" style="align-items:center">
        <span class="machine-card-name">${meta.name}</span>
        <span class="machine-card-area">${meta.area}</span>
      </div>
      <span class="machine-status-text ${statusClass}">${statusLabel}</span>
    </div>
    <div class="machine-ring-wrap">
      ${buildMachineRing(status, isAirtank)}
      <div class="machine-icon-center">
        ${icon}
      </div>
    </div>
    <div class="machine-card-metrics">
      ${metrics}
    </div>
  </div>`;
}

// ─── KPI Cards ────────────────────────────────────────
function buildKPICards(sys, units, metrics) {
  const { totalEnergy, energyCost, avgPressure, activeCount, totalCount } = metrics;
  
  // Dummy Carbon Credit Calculation (e.g. Total Energy * 0.8 / 1000)
  const carbonCredit = (parseFloat(totalEnergy) * 0.0008).toFixed(2);
  
  // Dummy comparison data for "Total kWh" (up/down)
  const lastMonthTotal = 45000;
  const currentTotal = parseFloat(totalEnergy) || 48000;
  const delta = currentTotal - lastMonthTotal;
  const deltaPct = ((delta / lastMonthTotal) * 100).toFixed(1);
  const isUp = delta > 0;

  return `
  <div class="kpi-row-figma" style="display:grid; grid-template-columns:repeat(5, 1fr); gap:20px; margin-bottom:24px">

    <!-- Total kWh Card -->
    <div class="kpi-figma-card">
      <div class="kpi-figma-label">Total kWh Bulan Ini<span class="kpi-figma-menu">···</span></div>
      <div class="spc-body" style="flex-direction:column; align-items:flex-start; margin-top:10px">
        <div class="spc-val-row" style="margin-bottom:8px">
          <span class="spc-value" style="font-size:32px">${currentTotal.toLocaleString('id-ID')}</span>
          <span class="spc-unit">kWh</span>
        </div>
        <div class="spc-trend-lbl ${isUp ? 'trend-bad' : 'trend-good'}">
          ${isUp 
            ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`
            : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>`}
          ${isUp ? 'Naik' : 'Turun'} ${Math.abs(deltaPct)}% vs bln lalu
        </div>
      </div>
    </div>

    <!-- Energy Cost Card -->
    <div class="kpi-figma-card">
      <div class="kpi-figma-label">Est. Biaya Energi<span class="kpi-figma-menu">···</span></div>
      <div class="savings-body" style="justify-content:center; padding-top:16px">
        <span class="savings-value" style="font-size:32px">Rp ${energyCost}</span>
      </div>
    </div>

    <!-- Avg Pressure Card -->
    <div class="kpi-figma-card">
      <div class="kpi-figma-label">Rata-Rata Pressure<span class="kpi-figma-menu">···</span></div>
      <div class="savings-body" style="justify-content:center; padding-top:16px">
        <span class="savings-value" style="font-size:32px">${avgPressure} <span style="font-size:16px;color:var(--text-muted)">Bar</span></span>
      </div>
    </div>

    <!-- Active Compressors Card -->
    <div class="kpi-figma-card">
      <div class="kpi-figma-label">Kompresor Aktif<span class="kpi-figma-menu">···</span></div>
      <div class="schedule-body" style="align-items:center; justify-content:center; padding-top:16px">
        <span class="schedule-unit-name" style="font-size:32px; color:var(--accent-cyan)">${activeCount} <span style="font-size:16px;color:var(--text-muted)">/ ${totalCount} Unit</span></span>
      </div>
    </div>

    <!-- Carbon Credit Card -->
    <div class="kpi-figma-card">
      <div class="kpi-figma-label">Carbon Credit<span class="kpi-figma-menu">···</span></div>
      <div class="savings-body" style="justify-content:center; padding-top:16px">
        <span class="savings-value" style="font-size:32px; color:var(--accent-green)">${carbonCredit} <span style="font-size:16px;color:var(--text-muted)">Ton CO₂</span></span>
      </div>
    </div>

  </div>`;
}

// ─── Overview Page Export ─────────────────────────────
var OverviewPage = {
  _unsub: null,
  _chartEnergy: null,

  render() {
    return `<div id="overviewRoot" class="page-enter" style="display:flex; flex-direction:column; min-height:calc(100vh - 80px);"></div>`;
  },

  mount() {
    this._draw(STATE.getState());
    this._unsub = STATE.subscribe(s => this._draw(s));
  },

  unmount() {
    if (this._unsub) this._unsub();
    if (this._chartEnergy) { this._chartEnergy.destroy(); this._chartEnergy = null; }
  },

  _draw(state) {
    const root = document.getElementById('overviewRoot');
    if (!root) return;

    const { system: sys, units: rawUnits, alarms } = state;
    const units       = rawUnits.map(normalizeUnit);
    const activeCount  = units.filter(u => u.status === 'RUNNING').length;
    const alarmCount   = alarms.filter(a => a.status === 'active').length;
    const avgPressure  = units.length
      ? (units.reduce((s, u) => s + (u.pressure || 0), 0) / units.length).toFixed(1)
      : '—';
    const totalEnergy  = units.reduce((s, u) => s + (u.energy_today || 0), 0).toFixed(0);
    const energyCost   = (parseFloat(totalEnergy) * 1487).toLocaleString('id-ID');

    root.innerHTML = `
      ${buildKPICards(sys, units, { avgPressure, totalEnergy, energyCost, activeCount, totalCount: units.length })}

      <div class="section-title">
        UNIT STATUS
        <span style="margin-left:auto;font-size:10px;font-weight:600;color:var(--text-secondary)">
          ${activeCount}/${units.length} unit berjalan
          ${alarmCount ? `· <span style="color:var(--accent-red)">${alarmCount} alarm aktif</span>` : ''}
        </span>
      </div>
      <div class="machine-grid" id="machineGrid">
        ${units.length
          ? units.map(u => buildMachineCard(u)).join('') + `
            <div class="machine-card add-device-card" onclick="OverviewPage._addDeviceDialog()" style="display:flex;flex-direction:column;align-items:center;justify-content:center;border:2px dashed var(--border-hover);background:transparent;cursor:pointer;opacity:0.7;transition:0.2s;">
              <div style="width:48px;height:48px;border-radius:24px;background:var(--bg-input);display:flex;align-items:center;justify-content:center;margin-bottom:12px">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </div>
              <div style="font-weight:700;color:var(--text-primary)">Add New Device</div>
            </div>
          `
          : '<div class="loading-state"><div class="spinner"></div></div>'}
      </div>

      <!-- Energy chart row -->
      <div style="margin-top:var(--sp-5); flex:1; display:flex; flex-direction:column;">
        <div class="section-title">ENERGY PER UNIT (kWh)</div>
        <div class="card" style="padding:var(--sp-4); flex:1; display:flex; flex-direction:column;">
          <div style="position:relative; flex:1; min-height:250px;">
            <canvas id="chartEnergy"></canvas>
          </div>
        </div>
      </div>
    `;

    this._buildChart(units);
  },

  _buildChart(units) {
    if (this._chartEnergy) this._chartEnergy.destroy();
    const ctx = document.getElementById('chartEnergy');
    if (!ctx || !units.length) return;

    const labels = units.map(u => (CONFIG.MACHINES[u.id] || {}).name || u.id);
    const data   = units.map(u => u.energy_today || 0);
    const colors = units.map(u => {
      if (u.status === 'ALARM')   return 'rgba(248,113,113,0.75)';
      if (u.status === 'RUNNING') return 'rgba(74,222,128,0.75)';
      return 'rgba(94,110,130,0.55)';
    });

    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(44,62,80,0.08)';
    const textColor = isDark ? '#9ea8ba' : '#4a637a';

    this._chartEnergy = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{ data, backgroundColor: colors, borderRadius: 5, borderSkipped: false }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: textColor, font: { size: 10 } } },
          y: { grid: { color: gridColor }, ticks: { color: textColor, font: { size: 10 } } }
        }
      }
    });
  },

  _addDeviceDialog() {
    UI.confirm(
      'Minta Akses Penambahan Perangkat',
      `Penambahan unit kompresor (Hardware baru) memerlukan konfigurasi langsung dari admin Node-RED dan integrasi sensor Modbus.<br><br>
       <input type="text" id="newDeviceName" placeholder="Nama/ID Perangkat Baru" class="filter-select" style="width:100%; margin-top:10px; padding:10px; font-weight:600">`,
      () => {
        const name = document.getElementById('newDeviceName')?.value || 'NEW-DEVICE';
        // Mocking the backend addition
        UI.toast(`Request pendaftaran perangkat [${name}] dikirim ke administrator.`, 'success');
        
        // Add locally to mock state for demo purposes
        const newId = name.toUpperCase().replace(/\s+/g, '-');
        if (!CONFIG.MACHINES[newId]) {
          CONFIG.MACHINES[newId] = { name: name, area: 'NEW AREA', type: 'boge' };
          STATE.units.push({
            id: newId, status: { is_running: false, is_alarm: false },
            metrics: { pressure: 0, power: 0, current: 0, voltage: 0, running_hours: 0, energy: 0 }
          });
          STATE._notify('update');
        }
      },
      'Request Akses'
    );
  }
};
