'use strict';

// ─── Detail Page Module ──────────────────────────────────────────────────────
var DetailPage = {
  _stateUnsub:  null,
  _selectedUnit: null,
  _gaugeAnimTimer: null,

  selectUnit(id) {
    this._selectedUnit = id;
  },

  render() {
    // Default to first unit
    if (!this._selectedUnit && STATE.units.length > 0) {
      this._selectedUnit = STATE.units[0].id;
    }

    const unitOptions = STATE.units.map(u =>
      `<option value="${u.id}" ${u.id === this._selectedUnit ? 'selected' : ''}>${u.id}</option>`
    ).join('');

    return `
      <!-- Unit Selector -->
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
        <div class="section-title" style="margin:0">UNIT:</div>
        <select class="filter-select" id="detailUnitSelect" style="font-size:14px;font-weight:700;padding:8px 16px">
          ${unitOptions}
        </select>
      </div>

      <!-- Detail Content -->
      <div id="detailContent">
        ${this._detailContent()}
      </div>

      <!-- Trend Popup/Section (Hidden by default, persistent outside auto-refresh) -->
      <div id="detailTrendSection" class="card" style="display:none; margin-top:24px; padding:20px; animation:fade-in 0.3s">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px">
          <div>
            <div class="section-title" id="trendTitle" style="margin:0 0 8px 0; font-size:16px">Parameter Trend</div>
            <div style="display:flex; gap:8px">
              <button class="btn btn-sm" style="background:var(--bg-input); font-size:10px" onclick="DetailPage._showTrend(DetailPage._currentTrendParam, 'day')">Hari Ini</button>
              <button class="btn btn-sm" style="background:var(--bg-input); font-size:10px" onclick="DetailPage._showTrend(DetailPage._currentTrendParam, 'week')">7 Hari</button>
              <button class="btn btn-sm" style="background:var(--bg-input); font-size:10px" onclick="DetailPage._showTrend(DetailPage._currentTrendParam, 'month')">Bulan Ini</button>
            </div>
          </div>
          
          <div style="display:flex; gap:20px; align-items:center; background:var(--bg-input); padding:8px 16px; border-radius:8px">
            <div style="text-align:center"><div style="font-size:10px;color:var(--text-muted);font-weight:700">MAX</div><div id="trendMax" style="font-size:14px;font-weight:700;color:var(--text-primary)">-</div></div>
            <div style="width:1px;height:20px;background:var(--border)"></div>
            <div style="text-align:center"><div style="font-size:10px;color:var(--text-muted);font-weight:700">MIN</div><div id="trendMin" style="font-size:14px;font-weight:700;color:var(--text-primary)">-</div></div>
            <div style="width:1px;height:20px;background:var(--border)"></div>
            <div style="text-align:center"><div style="font-size:10px;color:var(--text-muted);font-weight:700">AVG</div><div id="trendAvg" style="font-size:14px;font-weight:700;color:var(--text-primary)">-</div></div>
          </div>

          <button class="btn btn-sm btn-secondary" onclick="document.getElementById('detailTrendSection').style.display='none'">✕ Tutup</button>
        </div>
        <div style="height:250px; position:relative">
          <canvas id="detailTrendChart"></canvas>
        </div>
      </div>
    `;
  },

  _detailContent() {
    const unit = STATE.getUnit(this._selectedUnit);
    if (!unit) return `<div class="empty-state"><div class="spinner"></div></div>`;

    const { is_running, is_alarm, alarm_list = [] } = unit.status;
    const m = unit.metrics || {};
    const pressure = STATE.system.avg_pressure || 0;

    const meta = CONFIG.MACHINES[unit.id] || { type: 'boge' };
    const icon = window.MACHINE_ICONS ? window.MACHINE_ICONS[meta.type] : window.MACHINE_ICONS?.['boge'] || '';

    // Metric percentages (relative to max range)
    const voltPct    = Math.min(100, (parseFloat(m.voltage   || 0) / 440)  * 100);
    const currPct    = Math.min(100, (parseFloat(m.current   || 0) / 50)   * 100);
    const powerPct   = Math.min(100, (parseFloat(m.power     || 0) / 22)   * 100);
    const energyPct  = Math.min(100, (parseFloat(m.energy    || 0) / 500)  * 100);

    return `
      <div style="display:grid;grid-template-columns:320px 1fr;gap:20px;align-items:stretch">

        <!-- Icon Panel -->
        <div class="card" style="display:flex;flex-direction:column;justify-content:space-between;text-align:center; padding: 40px 20px; height:100%;">

          <!-- Status badge -->
          <div style="margin-bottom:24px; position:relative;">
            <button class="btn btn-sm btn-secondary" onclick="DetailPage._showTrend('status')" style="position:absolute; top:-10px; right:0; font-size:10px; padding:2px 8px;">Lihat Trend</button>
            <span class="status-badge ${is_alarm ? 'badge-alarm' : is_running ? 'badge-running' : 'badge-standby'}" style="font-size:12px; padding:6px 12px">
              ${is_alarm ? '⚠ ALARM' : is_running ? '▶ RUNNING' : '■ STANDBY'}
            </span>
          </div>

          <!-- SVG Icon -->
          <div style="display:flex; justify-content:center; align-items:center; height:120px; width:100%; opacity:${is_running ? '1' : '0.5'}; transform:scale(1);">
            ${icon}
          </div>
          <div style="font-size:24px; font-weight:800; color:var(--text-primary); margin-top:20px">${meta.name}</div>
          <div style="font-size:12px; font-weight:700; color:var(--text-muted); margin-top:4px">${unit.id} • ${meta.area}</div>
          <button class="btn btn-sm btn-secondary" onclick="DetailPage._editIdentity('${unit.id}')" style="margin-top:10px; font-size:10px; padding:4px 12px; margin-left:auto; margin-right:auto;">Edit Identity</button>

          <!-- Running hours -->
          <div style="margin-top:30px;padding-top:20px;border-top:1px solid var(--border)">
            <div style="font-size:10px;font-weight:700;color:var(--text-muted);letter-spacing:1px;margin-bottom:4px">RUNNING HOURS</div>
            <div style="font-size:24px;font-weight:700;color:var(--text-primary);font-variant-numeric:tabular-nums">${UI.fmt(m.running_hours, 0)} <span style="font-size:14px;color:var(--text-secondary)">h</span></div>
          </div>

          <!-- Alarm tags -->
          ${alarm_list.length ? `
            <div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border)">
              <div style="font-size:10px;font-weight:700;color:var(--accent-red);letter-spacing:1px;margin-bottom:8px">ACTIVE ALARMS</div>
              <div class="alarm-tags" style="justify-content:center">
                ${alarm_list.map(a => `<span class="alarm-tag">${CONFIG.ALARM_TYPES[a]?.label || a}</span>`).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Metrics Panel -->
        <div style="display:flex;flex-direction:column;gap:12px">

          <div class="section-title">ELECTRICAL METRICS</div>

          <div class="metric-bar-card">
            <div class="metric-bar-header">
              <div class="metric-bar-label">Voltage</div>
              <div style="display:flex;align-items:center;gap:12px">
                <button class="btn btn-sm btn-secondary" onclick="DetailPage._showTrend('voltage')" style="font-size:10px;padding:2px 8px">Lihat Trend</button>
                <div><span class="metric-bar-value">${is_running ? UI.fmt(m.voltage,1) : '—'}</span><span class="metric-bar-unit">V</span></div>
              </div>
            </div>
            <div class="progress-bar"><div class="progress-fill" style="width:${is_running ? voltPct : 0}%;background:linear-gradient(90deg,#58a6ff,#79baff)"></div></div>
            <div style="font-size:10px;color:var(--text-muted);margin-top:4px">Rentang: 0 – 440 V</div>
          </div>

          <div class="metric-bar-card">
            <div class="metric-bar-header">
              <div class="metric-bar-label">Current</div>
              <div style="display:flex;align-items:center;gap:12px">
                <button class="btn btn-sm btn-secondary" onclick="DetailPage._showTrend('current')" style="font-size:10px;padding:2px 8px">Lihat Trend</button>
                <div><span class="metric-bar-value">${is_running ? UI.fmt(m.current,1) : '—'}</span><span class="metric-bar-unit">A</span></div>
              </div>
            </div>
            <div class="progress-bar"><div class="progress-fill" style="width:${is_running ? currPct : 0}%;background:linear-gradient(90deg,#3fb950,#57d468)"></div></div>
            <div style="font-size:10px;color:var(--text-muted);margin-top:4px">Rentang: 0 – 50 A</div>
          </div>

          <div class="metric-bar-card">
            <div class="metric-bar-header">
              <div class="metric-bar-label">Power</div>
              <div style="display:flex;align-items:center;gap:12px">
                <button class="btn btn-sm btn-secondary" onclick="DetailPage._showTrend('power')" style="font-size:10px;padding:2px 8px">Lihat Trend</button>
                <div><span class="metric-bar-value">${is_running ? UI.fmt(m.power,1) : '—'}</span><span class="metric-bar-unit">kW</span></div>
              </div>
            </div>
            <div class="progress-bar"><div class="progress-fill" style="width:${is_running ? powerPct : 0}%;background:linear-gradient(90deg,#bc8cff,#d1b0ff)"></div></div>
            <div style="font-size:10px;color:var(--text-muted);margin-top:4px">Rentang: 0 – 22 kW</div>
          </div>

          <div class="metric-bar-card">
            <div class="metric-bar-header">
              <div class="metric-bar-label">Energy</div>
              <div style="display:flex;align-items:center;gap:12px">
                <button class="btn btn-sm btn-secondary" onclick="DetailPage._showTrend('energy')" style="font-size:10px;padding:2px 8px">Lihat Trend</button>
                <div><span class="metric-bar-value">${UI.fmt(m.energy, 1)}</span><span class="metric-bar-unit">kWh</span></div>
              </div>
            </div>
            <div class="progress-bar"><div class="progress-fill" style="width:${energyPct}%;background:linear-gradient(90deg,#d29922,#e6b93a)"></div></div>
            <div style="font-size:10px;color:var(--text-muted);margin-top:4px">Rentang: 0 – 500 kWh</div>
          </div>

          <!-- Summary stats row -->
          <div class="section-title" style="margin-top:8px">SUMMARY</div>
          <div class="grid-3">
            <div class="card card-sm" style="text-align:center">
              <div style="font-size:10px;color:var(--text-muted);font-weight:700;letter-spacing:1px;margin-bottom:4px">STATUS</div>
              <div style="font-size:14px;font-weight:700;color:${is_alarm ? 'var(--accent-red)' : is_running ? 'var(--accent-green)' : 'var(--text-muted)'}">
                ${is_alarm ? 'ALARM' : is_running ? 'RUNNING' : 'STANDBY'}
              </div>
            </div>
            <div class="card card-sm" style="text-align:center">
              <div style="font-size:10px;color:var(--text-muted);font-weight:700;letter-spacing:1px;margin-bottom:4px">AVG PRESSURE</div>
              <div style="font-size:14px;font-weight:700;color:var(--accent-purple)">${UI.fmt(pressure, 2)} <span style="font-size:11px;color:var(--text-muted)">Bar</span></div>
            </div>
            <div class="card card-sm" style="text-align:center">
              <div style="font-size:10px;color:var(--text-muted);font-weight:700;letter-spacing:1px;margin-bottom:4px">MODE</div>
              <div style="font-size:14px;font-weight:700;color:${STATE.system.system_mode === 'AUTO' ? 'var(--accent-cyan)' : 'var(--accent-orange)'}">
                ${STATE.system.system_mode}
              </div>
            </div>
          </div>

        </div>
      </div>
        </div>
      </div>
    `;
  },

  _editIdentity(id) {
    const meta = CONFIG.MACHINES[id] || {};
    UI.confirm(
      'Edit Identity',
      `<div style="display:flex;flex-direction:column;gap:12px;text-align:left;font-family:var(--font-sans)">
        <div>
          <label style="font-size:12px;font-weight:700;color:var(--text-muted)">Display Name</label>
          <input type="text" id="editMetaName" value="${meta.name||''}" style="width:100%;background:var(--bg-card);border:1px solid var(--border);color:var(--text-primary);padding:10px;border-radius:6px;margin-top:4px;font-weight:600">
        </div>
        <div>
          <label style="font-size:12px;font-weight:700;color:var(--text-muted)">Area</label>
          <input type="text" id="editMetaArea" value="${meta.area||''}" style="width:100%;background:var(--bg-card);border:1px solid var(--border);color:var(--text-primary);padding:10px;border-radius:6px;margin-top:4px;font-weight:600">
        </div>
      </div>`,
      () => {
        const name = document.getElementById('editMetaName')?.value || meta.name;
        const area = document.getElementById('editMetaArea')?.value || meta.area;
        if (typeof CONFIG.saveLocalOverrides === 'function') {
           CONFIG.saveLocalOverrides(id, name, area);
           if (typeof showToast === 'function') showToast('Identity updated', 'success');
           if (typeof Router !== 'undefined') {
             Router.navigate(Router.currentPage, Router._currentParams);
             // Also dispatch event for other components if needed
             document.dispatchEvent(new CustomEvent('metadatachanged'));
           } else {
             const dc = document.getElementById('detailContent');
             if (dc) dc.innerHTML = this._detailContent();
           }
        }
      }
    );
  },

  _trendChartInst: null,
  _currentTrendParam: null,

  _showTrend(param, timeframe = 'day') {
    this._currentTrendParam = param;
    const section = document.getElementById('detailTrendSection');
    const title = document.getElementById('trendTitle');
    const ctx = document.getElementById('detailTrendChart');
    if (!section || !title || !ctx) return;

    section.style.display = 'block';
    
    // Labels based on timeframe
    let labels = [];
    if (timeframe === 'day') labels = ['10:00','10:30','11:00','11:30','12:00','12:30','13:00'];
    else if (timeframe === 'week') labels = ['Sen','Sel','Rab','Kam','Jum','Sab','Min'];
    else labels = ['Week 1','Week 2','Week 3','Week 4'];
    
    // Generate dummy data
    let data = [];
    let color = '';
    let label = '';
    let isStep = false;
    
    const noise = () => (Math.random() - 0.5) * 5;
    
    if (param === 'voltage') { data = labels.map(()=>400 + noise()); color = '#58a6ff'; label = 'Voltage (V)'; title.innerText = 'Voltage Trend'; }
    if (param === 'current') { data = labels.map(()=>15 + noise()); color = '#3fb950'; label = 'Current (A)'; title.innerText = 'Current Trend'; }
    if (param === 'power')   { data = labels.map(()=>10 + noise()); color = '#bc8cff'; label = 'Power (kW)'; title.innerText = 'Power Trend'; }
    if (param === 'energy')  { data = labels.map(()=>130 + noise()*10); color = '#d29922'; label = 'Energy (kWh)'; title.innerText = 'Energy Trend'; }
    if (param === 'status')  { data = labels.map(()=>Math.random() > 0.3 ? 1 : 0); color = '#3fb950'; label = 'Status (1/0)'; title.innerText = 'Status Trend (Running=1, Stop=0)'; isStep = true; }

    // Update stats
    const maxVal = Math.max(...data).toFixed(isStep ? 0 : 1);
    const minVal = Math.min(...data).toFixed(isStep ? 0 : 1);
    const avgVal = (data.reduce((a,b)=>a+b,0)/data.length).toFixed(isStep ? 2 : 1);
    document.getElementById('trendMax').innerText = maxVal;
    document.getElementById('trendMin').innerText = minVal;
    document.getElementById('trendAvg').innerText = avgVal;

    if (this._trendChartInst) this._trendChartInst.destroy();

    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(44,62,80,0.08)';
    const textColor = isDark ? '#9ea8ba' : '#4a637a';

    this._trendChartInst = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label, data, borderColor: color, backgroundColor: color + '22',
          fill: true, tension: isStep ? 0 : 0.4, 
          stepped: isStep,
          pointRadius: 6, pointHoverRadius: 8,
          pointBackgroundColor: ctx=>{
            const v = ctx.raw;
            if(v == maxVal || v == minVal) return '#fff';
            return color;
          },
          pointBorderColor: color,
          pointBorderWidth: 2
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: textColor } },
          y: { grid: { color: gridColor }, ticks: { color: textColor } }
        }
      }
    });

    // Scroll to section seamlessly
    section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },

  _refreshContent() {
    const content = document.getElementById('detailContent');
    if (!content) return;
    content.innerHTML = this._detailContent();
  },

  init() {
    // Unit selector change
    const sel = document.getElementById('detailUnitSelect');
    if (sel) {
      sel.addEventListener('change', e => {
        this._selectedUnit = e.target.value;
        this._refreshContent();
      });
    }

    this._stateUnsub = STATE.on('update', () => {
      // Update selected unit if gone
      if (this._selectedUnit && !STATE.getUnit(this._selectedUnit)) {
        this._selectedUnit = STATE.units[0]?.id || null;
      }
      this._refreshContent();
    });
  },

  cleanup() {
    if (this._stateUnsub) this._stateUnsub();
    this._stateUnsub = null;
  }
};
