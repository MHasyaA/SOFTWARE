'use strict';

// ─── Alarm Page Module ───────────────────────────────────────────────────────
var AlarmPage = {
  _stateUnsub:  null,
  _alarmUnsub:  null,
  _filterUnit:  'all',
  _filterStatus:'all',

  render() {
    return `
      <!-- Filter Bar -->
      <div class="filter-bar">
        <span class="filter-label">Unit:</span>
        <select class="filter-select" id="alarmFilterUnit">
          <option value="all">Semua Unit</option>
          ${STATE.units.map(u => `<option value="${u.id}">${u.id}</option>`).join('')}
        </select>
        <span class="filter-label">Status:</span>
        <select class="filter-select" id="alarmFilterStatus">
          <option value="all">Semua Status</option>
          <option value="active">Active</option>
          <option value="passive">Passive</option>
          <option value="acknowledged">Acknowledged</option>
        </select>
        <div style="margin-left:auto;display:flex;align-items:center;gap:8px">
          <span id="alarmCount" style="font-size:12px;color:var(--text-secondary)"></span>
          <button class="btn btn-secondary btn-sm" id="btnClearAck" style="display:none">Hapus ACK</button>
        </div>
      </div>

      <!-- Alarm Table -->
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>DATE / TIME</th>
              <th>UNIT</th>
              <th>ALARM TYPE</th>
              <th>PRIORITY</th>
              <th>STATUS</th>
              <th>OFF TIME</th>
              <th>ACK BY</th>
              <th>ACK TIME</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody id="alarmTableBody">
            ${this._tableRows()}
          </tbody>
        </table>
      </div>

      ${!STATE.alarmHistory.length ? `
        <div class="empty-state" style="padding:48px">
          <div class="empty-state-icon">✅</div>
          <div class="empty-state-text">Tidak ada alarm</div>
          <div class="empty-state-sub">Semua unit beroperasi normal</div>
        </div>
      ` : ''}
    `;
  },

  _filtered() {
    return STATE.alarmHistory.filter(a => {
      const unitOk   = this._filterUnit   === 'all' || a.unit_id === this._filterUnit;
      const statusOk = this._filterStatus === 'all' || a.status === this._filterStatus;
      return unitOk && statusOk;
    });
  },

  _tableRows() {
    const rows = this._filtered();
    const canAck = AUTH.canAck();

    if (!rows.length) {
      return `<tr><td colspan="9" style="text-align:center;padding:32px;color:var(--text-muted)">Tidak ada data alarm</td></tr>`;
    }

    return rows.map(a => {
      const typeInfo = CONFIG.ALARM_TYPES[a.alarm_type] || { label: a.alarm_type, priority: 'UNKNOWN', priorityColor: '#8b949e' };
      const prioColor = typeInfo.priorityColor || '#8b949e';
      const isActive  = a.status === 'active';
      const isAck     = a.status === 'acknowledged';

      let statusBadge = '';
      if (isActive)     statusBadge = `<span class="status-badge badge-alarm">ACTIVE</span>`;
      else if (isAck)   statusBadge = `<span class="status-badge badge-standby" style="color:var(--text-muted)">ACKNOWLEDGED</span>`;
      else              statusBadge = `<span class="status-badge badge-standby">PASSIVE</span>`;

      const ackBtn = (isActive && canAck)
        ? `<button class="btn btn-sm" style="background:rgba(88,166,255,0.1);color:var(--accent-cyan);border-color:rgba(88,166,255,0.2)" onclick="AlarmPage._ack('${a.id}')">ACK</button>`
        : '—';

      return `
        <tr class="${isActive ? 'row-alarm' : ''} ${isAck ? 'row-ack' : ''}">
          <td style="font-family:'JetBrains Mono',monospace;font-size:12px;white-space:nowrap">${UI.fmtTime(a.timestamp)}</td>
          <td style="font-weight:700">${a.unit_id}</td>
          <td>${typeInfo.label}</td>
          <td><span style="color:${prioColor};font-weight:700;font-size:11px">${typeInfo.priority}</span></td>
          <td>${statusBadge}</td>
          <td style="font-family:'JetBrains Mono',monospace;font-size:12px">${a.off_time ? UI.fmtTime(a.off_time) : '—'}</td>
          <td style="color:var(--text-secondary)">${a.ack_by || '—'}</td>
          <td style="font-family:'JetBrains Mono',monospace;font-size:12px">${a.ack_time ? UI.fmtTime(a.ack_time) : '—'}</td>
          <td>${ackBtn}</td>
        </tr>
      `;
    }).join('');
  },

  _ack(alarmId) {
    const alarm   = STATE.alarmHistory.find(a => a.id === alarmId);
    const session = AUTH.getSession();
    if (!alarm || !session) return;

    UI.confirm(
      'Acknowledge Alarm?',
      `Unit: <strong>${alarm.unit_id}</strong><br>
       Tipe: <strong>${CONFIG.ALARM_TYPES[alarm.alarm_type]?.label || alarm.alarm_type}</strong><br><br>
       Konfirmasi bahwa Anda telah memeriksa dan menangani alarm ini?`,
      () => {
        const ackPayload = {
          alarm_id: alarmId,
          ack_by:   session.username,
          ack_time: new Date().toISOString()
        };
        WSManager.send('set/alarm_ack', ackPayload);
        STATE.ackAlarm(alarmId, session.username);
        this._refreshTable();
        UI.toast(`Alarm ${alarm.unit_id} di-acknowledge`, 'success');
      },
      'Acknowledge',
      false
    );
  },

  _refreshTable() {
    const tbody = document.getElementById('alarmTableBody');
    if (tbody) tbody.innerHTML = this._tableRows();
    this._updateCount();
  },

  _updateCount() {
    const countEl = document.getElementById('alarmCount');
    if (!countEl) return;
    const rows = this._filtered();
    const active = rows.filter(a => a.status === 'active').length;
    countEl.textContent = `${rows.length} alarm (${active} active)`;
  },

  _bindFilters() {
    const unitSel   = document.getElementById('alarmFilterUnit');
    const statusSel = document.getElementById('alarmFilterStatus');
    if (unitSel)   unitSel.addEventListener('change',   e => { this._filterUnit   = e.target.value; this._refreshTable(); });
    if (statusSel) statusSel.addEventListener('change', e => { this._filterStatus = e.target.value; this._refreshTable(); });
  },

  init() {
    this._updateCount();
    this._bindFilters();
    this._stateUnsub = STATE.on('update',   () => this._refreshTable());
    this._alarmUnsub = STATE.on('alarmAck', () => this._refreshTable());
  },

  cleanup() {
    if (this._stateUnsub) this._stateUnsub();
    if (this._alarmUnsub) this._alarmUnsub();
    this._stateUnsub = this._alarmUnsub = null;
  }
};
