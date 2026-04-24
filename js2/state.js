'use strict';

const STATE = {
  // ─── System data from downlink ───────────────────────────────────────────
  system: {
    system_mode: 'MANUAL',
    condition_mode: false,
    total_energy: 0,
    total_cost_energy: 0,
    carbon_credit: 0,
    avg_pressure: 0,
    active_units: 0
  },

  presets: {
    schedules: [],
    pressure:  []
  },

  units: [],

  // ─── Accumulated alarm history ─────────────────────────────────────────
  alarmHistory: [],

  // ─── Trend data cache ─────────────────────────────────────────────────
  trendData: null,

  // ─── WS status ───────────────────────────────────────────────────────
  wsStatus: 'disconnected', // 'disconnected' | 'connecting' | 'connected'

  // ─── Event emitter ────────────────────────────────────────────────────
  _listeners: {},

  on(event, cb) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(cb);
    return () => this.off(event, cb);
  },

  off(event, cb) {
    if (!this._listeners[event]) return;
    this._listeners[event] = this._listeners[event].filter(fn => fn !== cb);
  },

  emit(event, data) {
    if (this._listeners[event]) {
      this._listeners[event].forEach(cb => {
        try { cb(data); } catch(e) { console.error('State emit error:', e); }
      });
    }
  },

  // ─── Update from downlink dashboard/update ────────────────────────────
  update(data) {
    if (data.system) {
      Object.assign(this.system, data.system);
      // Normalize booleans
      this.system.condition_mode = Boolean(data.system.condition_mode);
    }

    if (data.presets) {
      if (Array.isArray(data.presets.schedules)) this.presets.schedules = data.presets.schedules;
      if (Array.isArray(data.presets.pressure))  this.presets.pressure  = data.presets.pressure;
    }

    if (Array.isArray(data.units)) {
      this.units = data.units;
      this._accumulateAlarms(data.units);
    }

    this.emit('update', this);
  },

  // ─── Accumulate alarm history from units[] ───────────────────────────
  _accumulateAlarms(units) {
    units.forEach(unit => {
      const s = unit.status || {};
      const alarm_list = s.alarm_list || [];
      const has_alarms = s.is_alarm || alarm_list.length > 0;
      
      if (!has_alarms || !Array.isArray(alarm_list)) return;

      alarm_list.forEach(alarmType => {
        const exists = this.alarmHistory.some(a =>
          a.unit_id === unit.id &&
          a.alarm_type === alarmType &&
          a.status === 'active'
        );
        if (!exists) {
          this.alarmHistory.unshift({
            id:         `ALM-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
            unit_id:    unit.id,
            alarm_type: alarmType,
            timestamp:  new Date().toISOString(),
            status:     'active',
            off_time:   null,
            ack_by:     null,
            ack_time:   null
          });
        }
      });

      // Auto-resolve alarms no longer in alarm_list
      this.alarmHistory.forEach(a => {
        if (a.unit_id === unit.id && a.status === 'active') {
          if (!alarm_list.includes(a.alarm_type)) {
            a.status   = 'passive';
            a.off_time = new Date().toISOString();
          }
        }
      });
    });

    const activeCount = this.alarmHistory.filter(a => a.status === 'active').length;
    this.emit('alarmCount', activeCount);
  },

  // ─── ACK an alarm ─────────────────────────────────────────────────────
  ackAlarm(alarmId, username) {
    const alarm = this.alarmHistory.find(a => a.id === alarmId);
    if (alarm) {
      alarm.ack_by   = username;
      alarm.ack_time = new Date().toISOString();
      alarm.status   = 'acknowledged';
      this.emit('alarmAck', alarm);
      this.emit('alarmCount', this.alarmHistory.filter(a => a.status === 'active').length);
    }
  },

  // ─── Get unit by id ───────────────────────────────────────────────────
  getUnit(id) {
    return this.units.find(u => u.id === id) || null;
  },

  // ─── Get full state snapshot ──────────────────────────────────────────
  getState() {
    return {
      system:      this.system,
      presets:     this.presets,
      units:       this.units,
      alarms:      this.alarmHistory,
      wsStatus:    this.wsStatus
    };
  },

  // ─── Subscribe to state updates (returns unsubscribe fn) ─────────────
  subscribe(callback) {
    const unsub = this.on('update', () => callback(this.getState()));
    return unsub;
  }
};

