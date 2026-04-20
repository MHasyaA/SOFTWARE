'use strict';

// ─── Cockpit Page Module ─────────────────────────────────────────────────────
var CockpitPage = {
  _stateUnsub: null,

  render() {
    const canCtrl = AUTH.canControl();
    return `
      <!-- Mode Control Bar -->
      <div class="mode-control-bar">
        <div class="mode-control-group">
          <div class="mode-control-label">MODE</div>
          <div class="mode-btn-group">
            <button class="mode-btn manual ${STATE.system.system_mode !== 'AUTO' ? 'active' : ''}"
              id="btnManual" ${!canCtrl ? 'disabled' : ''}>MANUAL</button>
            <button class="mode-btn auto ${STATE.system.system_mode === 'AUTO' ? 'active' : ''}"
              id="btnAuto" ${!canCtrl ? 'disabled' : ''}>AUTO</button>
          </div>
        </div>
        <div class="mode-control-group">
          <div class="mode-control-label">CONDITION</div>
          <label style="display:flex;align-items:center;cursor:pointer;background:${STATE.system.condition_mode ? 'rgba(74,222,128,0.2)' : 'var(--bg-input)'};padding:4px;border-radius:30px;width:100px;position:relative;border:1px solid ${STATE.system.condition_mode ? 'var(--accent-green)' : 'var(--border)'};transition:all 0.3s;${!canCtrl ? 'opacity:0.5;pointer-events:none' : ''}">
            <input type="checkbox" id="conditionToggle" ${STATE.system.condition_mode ? 'checked' : ''} style="display:none">
            <div style="position:absolute;left:${STATE.system.condition_mode ? '50px' : '4px'};width:44px;height:24px;border-radius:20px;background:${STATE.system.condition_mode ? 'var(--accent-green)' : 'var(--text-muted)'};transition:all 0.3s;box-shadow:${STATE.system.condition_mode ? '0 0 10px rgba(74,222,128,0.5)' : 'none'}"></div>
            <div style="width:44px;text-align:center;font-size:10px;font-weight:800;color:${!STATE.system.condition_mode ? 'var(--bg-card)' : 'var(--text-muted)'};z-index:1;padding:4px 0">OFF</div>
            <div style="width:44px;text-align:center;font-size:10px;font-weight:800;color:${STATE.system.condition_mode ? 'var(--bg-card)' : 'var(--text-muted)'};z-index:1;padding:4px 0;margin-left:auto">ON</div>
          </label>
        </div>
        ${!canCtrl ? `<div style="margin-left:auto;font-size:11px;color:var(--text-muted)">⚠ Role Viewer: Kontrol dinonaktifkan</div>` : ''}
      </div>

      <!-- Unit Control Cards -->
      <div class="section-title">UNIT CONTROL</div>
      <div id="cockpitUnitList" style="display:flex;flex-direction:column;gap:10px">
        ${this._unitCards()}
      </div>
    `;
  },

  _unitCards() {
    const isAuto  = STATE.system.system_mode === 'AUTO';
    const canCtrl = AUTH.canControl();
    const ctrlDisabled = isAuto || !canCtrl;

    if (!STATE.units.length) {
      return `<div class="empty-state"><div class="spinner"></div><div class="empty-state-text">Menunggu data...</div></div>`;
    }

    return STATE.units.map(unit => {
      const { is_running, is_alarm } = unit.status;
      const m = unit.metrics || {};
      const cardClass = is_alarm ? 'is-alarm' : is_running ? 'is-running' : '';
      const meta = CONFIG.MACHINES[unit.id] || { name: unit.id, area: '' };

      return `
        <div class="cockpit-card ${cardClass}">
          <div class="cockpit-info">
            <div>
              <div class="cockpit-id" style="font-size:16px">${meta.name}</div>
              <div style="font-size:10px; color:var(--text-muted); font-weight:700; margin-bottom:6px">${unit.id} • ${meta.area}</div>
              <span class="status-badge ${is_alarm ? 'badge-alarm' : is_running ? 'badge-running' : 'badge-standby'}" style="font-size:9px">
                ${is_alarm ? 'ALARM' : is_running ? 'RUNNING' : 'STANDBY'}
              </span>
            </div>
            <div class="cockpit-metrics">
              <div class="cockpit-metric">
                <div class="cockpit-metric-label">Voltage</div>
                <div class="cockpit-metric-val">${is_running ? UI.fmt(m.voltage,1) : '—'} V</div>
              </div>
              <div class="cockpit-metric">
                <div class="cockpit-metric-label">Current</div>
                <div class="cockpit-metric-val">${is_running ? UI.fmt(m.current,1) : '—'} A</div>
              </div>
              <div class="cockpit-metric">
                <div class="cockpit-metric-label">Power</div>
                <div class="cockpit-metric-val">${is_running ? UI.fmt(m.power,1) : '—'} kW</div>
              </div>
              <div class="cockpit-metric">
                <div class="cockpit-metric-label">Energy</div>
                <div class="cockpit-metric-val">${UI.fmt(m.energy,1)} kWh</div>
              </div>
            </div>
          </div>
          <div class="cockpit-controls" style="flex-direction:row; gap:12px; align-items:center;">
            ${is_alarm ? `<span style="color:var(--accent-red);font-size:11px;font-weight:700;margin-right:auto">⚠ ALARM</span>` : ''}
            <label style="display:flex;align-items:center;cursor:pointer;background:${is_running ? 'rgba(74,222,128,0.2)' : 'var(--bg-input)'};padding:4px;border-radius:30px;width:120px;position:relative;border:1px solid ${is_running ? 'var(--accent-green)' : 'var(--border)'};transition:all 0.3s;${ctrlDisabled ? 'opacity:0.5;pointer-events:none' : ''}">
              <input type="checkbox" class="unit-toggle" data-unit="${unit.id}" ${is_running ? 'checked' : ''} style="display:none">
              <div style="position:absolute;left:${is_running ? '64px' : '4px'};width:50px;height:24px;border-radius:20px;background:${is_running ? 'var(--accent-green)' : 'var(--text-muted)'};transition:all 0.3s;box-shadow:${is_running ? '0 0 10px rgba(74,222,128,0.5)' : 'none'}"></div>
              <div style="width:50px;text-align:center;font-size:11px;font-weight:800;color:${!is_running ? 'var(--bg-card)' : 'var(--text-muted)'};z-index:1;padding:4px 0">STOP</div>
              <div style="width:50px;text-align:center;font-size:11px;font-weight:800;color:${is_running ? 'var(--bg-card)' : 'var(--text-muted)'};z-index:1;padding:4px 0;margin-left:auto">START</div>
            </label>
          </div>
        </div>
      `;
    }).join('');
  },

  _bindEvents() {
    const isAuto  = STATE.system.system_mode === 'AUTO';
    const canCtrl = AUTH.canControl();

    // Mode buttons
    const btnManual = document.getElementById('btnManual');
    const btnAuto   = document.getElementById('btnAuto');

    if (btnManual && canCtrl) {
      btnManual.addEventListener('click', () => this._setMode(false));
    }
    if (btnAuto && canCtrl) {
      btnAuto.addEventListener('click', () => this._setMode(true));
    }

    // Condition toggle
    const condTgl = document.getElementById('conditionToggle');
    if (condTgl && canCtrl) {
      condTgl.addEventListener('change', e => this._setCondition(e.target.checked));
    }

    // Unit action buttons
    document.querySelectorAll('.unit-toggle').forEach(toggle => {
      toggle.addEventListener('change', e => {
        const unitId = e.target.dataset.unit;
        const action = e.target.checked;

        if (isAuto && canCtrl) {
          e.target.checked = !action; // revert locally
          UI.toast('Pindah ke mode MANUAL untuk mengontrol unit', 'warn');
          return;
        }

        UI.confirm(
          `${action ? 'Nyalakan' : 'Matikan'} ${unitId}?`,
          `Apakah Anda yakin ingin <strong>${action ? 'menghidupkan' : 'mematikan'}</strong> unit <strong>${unitId}</strong>?`,
          () => {
            WSManager.send('set/action', { target: unitId, action });
            UI.toast(`${unitId} → ${action ? 'START' : 'STOP'}`, action ? 'success' : 'info');
          },
          action ? 'Hidupkan' : 'Matikan',
          !action
        );
        e.target.checked = !action; // revert until web-socket affirms
      });
    });
  },

  _setMode(auto) {
    UI.confirm(
      `Pindah ke mode ${auto ? 'AUTO' : 'MANUAL'}?`,
      `Sistem akan beralih ke mode <strong>${auto ? 'AUTO' : 'MANUAL'}</strong>. ${auto ? 'Kontrol unit otomatis berdasarkan jadwal & kondisi.' : 'Kontrol unit akan dilakukan secara manual.'}`,
      () => {
        WSManager.send('set/mode', { auto, condition: STATE.system.condition_mode });
        UI.toast(`Mode → ${auto ? 'AUTO' : 'MANUAL'}`, 'success');
      },
      'Konfirmasi'
    );
  },

  _setCondition(enabled) {
    WSManager.send('set/mode', {
      auto:      STATE.system.system_mode === 'AUTO',
      condition: enabled
    });
    const lbl = document.getElementById('conditionLabel');
    if (lbl) lbl.textContent = enabled ? 'ON' : 'OFF';
    UI.toast(`Condition → ${enabled ? 'ON' : 'OFF'}`, 'info');
  },

  _refreshUI() {
    const list = document.getElementById('cockpitUnitList');
    if (!list) return;
    list.innerHTML = this._unitCards();
    this._bindUnitToggles();

    // Update mode buttons
    const isAuto = STATE.system.system_mode === 'AUTO';
    const btnManual = document.getElementById('btnManual');
    const btnAuto   = document.getElementById('btnAuto');
    if (btnManual) btnManual.classList.toggle('active', !isAuto);
    if (btnAuto)   btnAuto.classList.toggle('active',  isAuto);

    // Update condition
    const condTgl = document.getElementById('conditionToggle');
    if (condTgl) {
      condTgl.checked = STATE.system.condition_mode;
      const lblOff = condTgl.parentElement.children[2];
      const lblOn = condTgl.parentElement.children[3];
      const ball = condTgl.parentElement.children[1];
      if(STATE.system.condition_mode) {
        condTgl.parentElement.style.background = 'rgba(74,222,128,0.2)';
        condTgl.parentElement.style.borderColor = 'var(--accent-green)';
        ball.style.left = '50px';
        ball.style.background = 'var(--accent-green)';
        ball.style.boxShadow = '0 0 10px rgba(74,222,128,0.5)';
        lblOff.style.color = 'var(--text-muted)';
        lblOn.style.color = 'var(--bg-card)';
      } else {
        condTgl.parentElement.style.background = 'var(--bg-input)';
        condTgl.parentElement.style.borderColor = 'var(--border)';
        ball.style.left = '4px';
        ball.style.background = 'var(--text-muted)';
        ball.style.boxShadow = 'none';
        lblOff.style.color = 'var(--bg-card)';
        lblOn.style.color = 'var(--text-muted)';
      }
    }
  },

  _bindUnitToggles() {
    const isAuto  = STATE.system.system_mode === 'AUTO';
    const canCtrl = AUTH.canControl();
    document.querySelectorAll('.unit-toggle').forEach(toggle => {
      toggle.addEventListener('change', e => {
        const unitId = e.target.dataset.unit;
        const action = e.target.checked;

        if (isAuto || !canCtrl) {
          e.target.checked = !action; // revert locally
          UI.toast(isAuto ? 'Pindah ke MANUAL untuk kontrol unit' : 'Akses ditolak (role Viewer)', 'warn');
          return;
        }

        UI.confirm(
          `${action ? 'Nyalakan' : 'Matikan'} ${unitId}?`,
          `Konfirmasi untuk <strong>${action ? 'menghidupkan' : 'mematikan'}</strong> unit <strong>${unitId}</strong>.`,
          () => {
            WSManager.send('set/action', { target: unitId, action });
            UI.toast(`${unitId} → ${action ? 'START' : 'STOP'}`, action ? 'success' : 'info');
          },
          action ? 'Hidupkan' : 'Matikan',
          !action
        );
        e.target.checked = !action; // revert locally until websocket confirms
      });
    });
  },

  init() {
    this._bindEvents();
    this._stateUnsub = STATE.on('update', () => this._refreshUI());
  },

  cleanup() {
    if (this._stateUnsub) this._stateUnsub();
    this._stateUnsub = null;
  }
};
