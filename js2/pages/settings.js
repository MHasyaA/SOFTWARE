'use strict';
/* ═══════════════════════════════════════════════════════
   SETTINGS PAGE — Scheduling Table (Figma style)
   Tabbed by area, time input per machine, toggle on/off
═══════════════════════════════════════════════════════ */

var SettingsPage = {
  _unsub: null,
  _activeMainTab: 'schedule', // 'schedule' or 'condition'
  
  _activeMainTab: 'schedule', // 'schedule' or 'condition'

  render() {
    return `<div id="settingsRoot" class="page-enter"></div>`;
  },

  mount() {
    this._draw();
    this._unsub = STATE.subscribe(s => this._syncFromState(s));
  },

  unmount() {
    if (this._unsub) this._unsub();
  },

  _syncFromState(state) {
    // Sync dummy logic if necessary
  },

  _draw() {
    const root = document.getElementById('settingsRoot');
    if (!root) return;
    const canEdit = AUTH.canSettings();

    const isSched = this._activeMainTab === 'schedule';

    root.innerHTML = `
      <div class="page-header" style="margin-bottom:24px">
        <div>
          <div style="font-size:18px;font-weight:800;color:var(--text-primary)">Scheduling & Condition</div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:3px">Panel konfigurasi matriks jam operasi dan kondisi limitasi kompresor</div>
        </div>
        ${canEdit ? `<button class="sched-send-btn" id="matrixSendBtn" style="padding:10px 24px">Simpan Konfigurasi</button>` : ''}
      </div>

      <!-- Main Tabs -->
      <div style="display:flex; gap:0; margin-bottom:0;">
        <button class="matrix-tab ${isSched ? 'active' : ''}" data-tab="schedule">Schedule</button>
        <button class="matrix-tab ${!isSched ? 'active' : ''}" data-tab="condition">Condition</button>
      </div>

      <div class="card" style="border-top-left-radius:0; padding:20px; overflow-x:auto;">
        ${isSched ? this._renderScheduleTable() : this._renderConditionTable()}
      </div>

      <!-- Inject specific CSS for this matrix UI -->
      <style>
        .matrix-tab {
          background: var(--bg-card);
          color: var(--text-muted);
          border: 1px solid var(--border);
          border-bottom: none;
          padding: 12px 32px;
          font-weight: 800;
          font-size: 14px;
          border-radius: 12px 12px 0 0;
          cursor: pointer;
          transition: 0.3s;
          opacity: 0.7;
        }
        .matrix-tab.active {
          opacity: 1;
          color: var(--accent-blue);
          border-top: 3px solid var(--accent-blue);
          background: var(--bg-card);
          z-index: 2;
          position: relative;
        }
        .matrix-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1000px;
        }
        .matrix-table th, .matrix-table td {
          border: 1px solid var(--border);
          padding: 16px;
          vertical-align: middle;
          text-align: center;
        }
        .matrix-table th {
          background: var(--bg-input);
          color: var(--text-primary);
          font-weight: 800;
          font-size: 11px;
          letter-spacing: 1px;
        }
        .matrix-input {
          background: var(--bg-card);
          border: 1px solid var(--border);
          color: var(--text-primary);
          width: 40px;
          text-align: center;
          padding: 4px;
          font-weight: 700;
          border-radius: 4px;
        }
        .comp-toggle-cell {
          text-align: center;
          font-size: 11px;
          font-weight: 700;
          color: var(--text-primary);
        }
        /* Cockpit Style Slider */
        .cockpit-slider {
          display: flex;
          align-items: center;
          cursor: pointer;
          background: rgba(74,222,128,0.2);
          padding: 4px;
          border-radius: 30px;
          width: 70px;
          position: relative;
          border: 1px solid var(--accent-green);
          transition: all 0.3s;
          margin-top: 8px;
        }
        .cockpit-slider.off-state {
          background: var(--bg-input);
          border: 1px solid var(--border);
        }
        .cockpit-slider input:checked + .slider-ball {
          left: 42px;
          background: var(--accent-green);
          box-shadow: 0 0 10px rgba(74,222,128,0.5);
        }
        .slider-ball {
          position: absolute;
          left: 4px;
          width: 24px;
          height: 16px;
          border-radius: 20px;
          background: var(--text-muted);
          transition: all 0.3s;
        }
        .slider-text-off { width: 44px; text-align: center; font-size: 9px; font-weight: 800; color: var(--text-muted); z-index: 1; margin-left: 20px; }
        .cockpit-slider input:checked ~ .slider-text-off { display:none; }
        
        .slider-text-on { width: 44px; text-align: center; font-size: 9px; font-weight: 800; color: var(--bg-card); z-index: 1; display:none; }
        .cockpit-slider input:checked ~ .slider-text-on { display:block; }
      </style>
    `;

    this._bindEvents(root, canEdit);
  },

  _renderScheduleTable() {
    const rawMachines = Object.entries(CONFIG.MACHINES).map(([id, m]) => ({id, ...m}));
    const uniqueAreas = [...new Set(rawMachines.map(m => m.area))];
    
    // Group machines by their area so the table columns align with headers
    const machines = [];
    let thColsHtml = '';
    uniqueAreas.forEach(area => {
       const compsInArea = rawMachines.filter(m => m.area === area);
       machines.push(...compsInArea);
       thColsHtml += `<th colspan="${compsInArea.length}" style="font-size:10px;color:var(--text-muted)">${area}</th>`;
    });

    let rows = '';
    for(let i=1; i<=6; i++) {
      let compsHtml = '';
      machines.forEach(m => {
        compsHtml += `
          <td class="comp-toggle-cell" style="text-align:left; padding-left:12px;">
            <div style="margin-left:4px">${m.name}</div>
            <label class="cockpit-slider">
              <input type="checkbox" style="display:none" checked onchange="this.parentElement.classList.toggle('off-state', !this.checked)">
              <div class="slider-ball"></div>
              <div class="slider-text-off">OFF</div>
              <div class="slider-text-on">ON</div>
            </label>
          </td>
        `;
      });

      rows += `
        <tr>
          <td style="font-weight:800;font-size:16px">${i}</td>
          <td>
            <div style="display:flex;align-items:center;justify-content:center;gap:6px;font-size:12px;font-weight:700">
              <div style="text-align:center"><div style="font-size:9px;color:var(--text-muted)">HH</div><input type="text" value="00" class="matrix-input"></div> :
              <div style="text-align:center"><div style="font-size:9px;color:var(--text-muted)">MM</div><input type="text" value="00" class="matrix-input"></div>
              <span>—</span>
              <div style="text-align:center"><div style="font-size:9px;color:var(--text-muted)">HH</div><input type="text" value="00" class="matrix-input"></div> :
              <div style="text-align:center"><div style="font-size:9px;color:var(--text-muted)">MM</div><input type="text" value="00" class="matrix-input"></div>
            </div>
          </td>
          ${compsHtml}
          <td>
            <div style="font-size:11px;font-weight:800;color:var(--text-primary);margin-bottom:8px">ACTIVE</div>
            <label class="cockpit-slider" style="margin: 0 auto;">
              <input type="checkbox" style="display:none" checked onchange="this.parentElement.classList.toggle('off-state', !this.checked)">
              <div class="slider-ball"></div>
              <div class="slider-text-off">OFF</div>
              <div class="slider-text-on">ON</div>
            </label>
          </td>
        </tr>
      `;
    }

    return `
      <table class="matrix-table">
        <thead>
          <tr>
            <th rowspan="2" style="width:50px">NO</th>
            <th rowspan="2" style="width:250px">JAM</th>
            <th colspan="${machines.length}">COMPRESSOR</th>
            <th rowspan="2" style="width:100px">STATUS</th>
          </tr>
          <tr>
            ${thColsHtml}
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;
  },

  _renderConditionTable() {
    const machines = Object.entries(CONFIG.MACHINES).map(([id, m]) => ({id, ...m}));
    const uniqueAreas = [...new Set(machines.map(m => m.area))];
    
    const renderCompRow = (comps) => {
      let html = '<div style="display:flex; justify-content:flex-start; align-items:center; flex:1; padding: 12px 24px; gap:40px;">';
      comps.forEach(m => {
        html += `
          <div class="comp-toggle-cell" style="text-align:left;">
            <div style="margin-bottom:6px; margin-left:4px;">${m.name}</div>
            <label class="cockpit-slider">
              <input type="checkbox" style="display:none" checked onchange="this.parentElement.classList.toggle('off-state', !this.checked)">
              <div class="slider-ball"></div>
              <div class="slider-text-off">OFF</div>
              <div class="slider-text-on">ON</div>
            </label>
          </div>
        `;
      });
      html += '</div>';
      return html;
    };

    const buildAreaRow = (no, areaName, comps) => {
      return `
        <tr>
          <td style="font-weight:800;font-size:16px">${no}</td>
          <td style="font-weight:800;font-size:14px;color:var(--text-primary)">${areaName}</td>
          
          <td style="padding:0">
            <div style="display:flex;flex-direction:column;height:100%">
              <div style="display:flex;align-items:center;justify-content:center;gap:12px;padding:16px;border-bottom:1px solid var(--border)">
                <span style="font-weight:800;width:20px">&ge;</span> <input type="number" value="6" class="matrix-input">
              </div>
              <div style="display:flex;align-items:center;justify-content:center;gap:12px;padding:16px">
                <span style="font-weight:800;width:20px">&lt;</span> <input type="number" value="5" class="matrix-input">
              </div>
            </div>
          </td>

          <td style="padding:0">
            <div style="display:flex;flex-direction:column;height:100%">
              ${renderCompRow(comps)}
              <div style="height:1px; background:var(--border); width:100%"></div>
              ${renderCompRow(comps)}
            </div>
          </td>
        </tr>
      `;
    };

    let rowsHtml = '';
    uniqueAreas.forEach((area, i) => {
       const comps = machines.filter(m => m.area === area);
       rowsHtml += buildAreaRow(i+1, area, comps);
    });

    return `
      <table class="matrix-table">
        <thead>
          <tr>
            <th style="width:50px">NO</th>
            <th style="width:200px">AREA</th>
            <th style="width:200px">SP. PRESSURE</th>
            <th>COMPRESSOR</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    `;
  },

  _bindEvents(root, canEdit) {
    // Main Tabs toggle
    root.querySelectorAll('.matrix-tab').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this._activeMainTab = e.currentTarget.dataset.tab;
        this._draw();
      });
    });

    // Dummy toast for send
    const sendBtn = root.querySelector('#matrixSendBtn');
    if (sendBtn) {
      sendBtn.addEventListener('click', () => {
        if (typeof showToast === 'function') showToast('Konfigurasi Matrix berhasil dikirim', 'success');
        else alert('Simpan & Kirim OK');
      });
    }
  }
};
