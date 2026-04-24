("use strict");

// ─── WebSocket Manager ──────────────────────────────────────────────────────
const WSManager = {
  ws: null,
  reconnectTimer: null,
  reconnectCount: 0,
  mockTimer: null,
  _useMock: false,

  // ─── Connect ────────────────────────────────────────────────────────
  connect() {
    STATE.wsStatus = "connecting";
    STATE.emit("wsStatus", "connecting");
    this._updateStatusBar();

    try {
      this.ws = new WebSocket(CONFIG.WS_URL);

      this.ws.onopen = () => {
        this.reconnectCount = 0;
        STATE.wsStatus = "connected";
        STATE.emit("wsStatus", "connected");
        this._updateStatusBar();
        UI.toast("WebSocket terhubung ke Node-RED", "success");
        // Stop mock if real WS connected
        this._stopMock();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this._dispatch(data);
        } catch (e) {
          console.error("[WS] Parse error:", e);
        }
      };

      this.ws.onclose = () => {
        STATE.wsStatus = "disconnected";
        STATE.emit("wsStatus", "disconnected");
        this._updateStatusBar();
        this._scheduleReconnect();
      };

      this.ws.onerror = () => {
        STATE.wsStatus = "disconnected";
        STATE.emit("wsStatus", "disconnected");
        this._updateStatusBar();
        // Start mock data if WS fails
        if (!this._useMock) this._startMock();
      };
    } catch (e) {
      console.warn("[WS] Connection failed, starting mock mode");
      STATE.wsStatus = "disconnected";
      this._updateStatusBar();
      this._startMock();
    }
  },

  // ─── Dispatch incoming message ────────────────────────────────────────
  _dispatch(data) {
    switch (data.topic) {
      case "dashboard/update":
        STATE.update(data.payload || data);
        break;
      case "trend/data":
        STATE.trendData = data.payload;
        STATE.emit("trendData", data.payload);
        break;
      default:
        console.log("[WS] Unknown topic:", data.topic, data);
    }
  },

  // ─── Send uplink ──────────────────────────────────────────────────────
  send(topic, payloadData) {
    // Sesuaikan dengan format bapak: { topic: "...", payload: {...} }
    const payload = { topic: topic, payload: payloadData };
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
      console.log("[WS] Sent:", payload);
      return true;
    }
    // Mock mode: simulate response
    if (this._useMock) {
      console.log("[MOCK] Uplink:", payload);
      this._handleMockUplink(topic, payloadData);
      return true;
    }
    UI.toast("WebSocket tidak terhubung", "error");
    return false;
  },

  // ─── Auto-reconnect ───────────────────────────────────────────────────
  _scheduleReconnect() {
    if (this.reconnectCount >= CONFIG.WS_MAX_RECONNECTS) {
      console.warn("[WS] Max reconnects reached, switching to mock mode");
      this._startMock();
      return;
    }
    this.reconnectCount++;
    const delay = Math.min(
      CONFIG.WS_RECONNECT_INTERVAL * this.reconnectCount,
      30000,
    );
    this.reconnectTimer = setTimeout(() => this.connect(), delay);
  },

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.ws) this.ws.close();
    this._stopMock();
  },

  // ─── Status bar indicator ────────────────────────────────────────────
  _updateStatusBar() {
    const el = document.getElementById("wsIndicator");
    if (!el) return;
    const map = {
      connected: { cls: "ws-connected", text: "LIVE" },
      connecting: { cls: "ws-connecting", text: "CONN..." },
      disconnected: { cls: "ws-disconnected", text: "OFFLINE" },
    };
    const s = map[STATE.wsStatus] || map.disconnected;
    el.className = `ws-indicator ${s.cls}`;
    el.textContent = this._useMock ? "MOCK" : s.text;
  },

  // ─── Mock Data Simulator ─────────────────────────────────────────────
  _startMock() {
    if (this._useMock) return;
    this._useMock = true;
    this._updateStatusBar();
    console.info("[MOCK] Starting mock data simulator (Data generation disabled for production)");
    
    // Note: this._pushMockData() is commented out to prevent fake data 
    // from overriding Node-RED payload when connection is lost.
  },

  _stopMock() {
    if (this.mockTimer) {
      clearInterval(this.mockTimer);
      this.mockTimer = null;
    }
    this._useMock = false;
  },

  _mockState: {
    units: [
      { id: "COMP-01", running: true, alarm: false, alarms: [] },
      { id: "COMP-02", running: true, alarm: false, alarms: [] },
      { id: "COMP-03", running: false, alarm: false, alarms: [] },
      {
        id: "COMP-04",
        running: true,
        alarm: true,
        alarms: ["HIGH_TEMP", "HIGH_CURRENT"],
      },
      { id: "COMP-05", running: false, alarm: false, alarms: [] },
      { id: "COMP-06", running: true, alarm: false, alarms: [] },
      { id: "COMP-07", running: true, alarm: false, alarms: [] },
    ],
    mode: "MANUAL",
    condition: true,
    t: 0,
  },

  _pushMockData() {
    const ms = this._mockState;
    ms.t += 1;

    // Fluctuate metrics slightly
    const rnd = (base, variance) =>
      (base + (Math.random() - 0.5) * variance * 2).toFixed(1);
    const activeCount = ms.units.filter((u) => u.running).length;

    const payload = {
      topic: "dashboard/update",
      system: {
        system_mode: ms.mode,
        condition_mode: ms.condition,
        total_energy: rnd(1250, 20),
        total_cost_energy: rnd(1875000, 5000),
        carbon_credit: rnd(312, 5),
        avg_pressure: rnd(6.2, 0.3),
        active_units: String(activeCount),
      },
      presets: {
        schedules: [
          {
            id: 1,
            start: "08:00",
            end: "17:00",
            assigned_on: ["COMP-01", "COMP-02"],
            is_matching: true,
          },
          {
            id: 2,
            start: "17:00",
            end: "22:00",
            assigned_on: ["COMP-03"],
            is_matching: false,
          },
          {
            id: 3,
            start: "22:00",
            end: "06:00",
            assigned_on: ["COMP-05", "COMP-06"],
            is_matching: false,
          },
          {
            id: 4,
            start: "06:00",
            end: "08:00",
            assigned_on: ["COMP-07"],
            is_matching: false,
          },
        ],
        pressure: [
          {
            id: 1,
            pressure_high: "7",
            pressure_low: "5",
            assigned_high: ["COMP-01", "COMP-02"],
            assigned_low: ["COMP-01"],
          },
          {
            id: 2,
            pressure_high: "8",
            pressure_low: "6",
            assigned_high: ["COMP-04", "COMP-05"],
            assigned_low: ["COMP-04"],
          },
          {
            id: 3,
            pressure_high: "7",
            pressure_low: "5",
            assigned_high: ["COMP-06", "COMP-07"],
            assigned_low: ["COMP-06"],
          },
        ],
      },
      units: ms.units.map((u, i) => ({
        id: u.id,
        status: {
          is_running: u.running,
          is_alarm: u.alarm,
          alarm_list: u.alarms,
        },
        metrics: {
          voltage: u.running ? rnd(385 + i * 2, 5) : "0",
          current: u.running ? rnd(28 + i * 1, 3) : "0",
          power: u.running ? rnd(15 + i * 0.5, 2) : "0",
          energy: rnd(320 + i * 15, 10),
          running_hours: rnd(1200 + i * 50, 0),
        },
      })),
    };

    this._dispatch(payload);
  },

  _handleMockUplink(topic, load) {
    const ms = this._mockState;
    switch (topic) {
      case "set/action": {
        const u = ms.units.find((u) => u.id === load.target);
        if (u) u.running = Boolean(load.action);
        break;
      }
      case "set/mode":
        ms.mode = load.auto ? "AUTO" : "MANUAL";
        ms.condition = Boolean(load.condition);
        break;
      case "set/alarm_ack":
        STATE.ackAlarm(load.alarm_id, load.ack_by);
        break;
      case "get/trend":
        this._sendMockTrend(load);
        break;
    }
  },

  _sendMockTrend(req) {
    const points =
      req.range === "1d" ? 24 : req.range === "7d" ? 7 * 24 : 30 * 24;
    const now = Date.now();
    const intervalMs = { "1d": 3600000, "7d": 3600000, "30d": 3600000 }[
      req.range
    ];

    const baseValues = {
      pressure: 6.2,
      voltage: 387,
      current: 29,
      power: 15.5,
    };
    const base = baseValues[req.metric] || 6;

    const data = Array.from({ length: points }, (_, i) => ({
      timestamp: new Date(now - (points - i) * intervalMs).toISOString(),
      value: parseFloat(
        (
          base +
          Math.sin(i * 0.3) * base * 0.1 +
          (Math.random() - 0.5) * base * 0.05
        ).toFixed(2),
      ),
    }));

    setTimeout(() => {
      this._dispatch({
        topic: "trend/data",
        load: { unit: req.unit, metric: req.metric, range: req.range, data },
      });
    }, 400);
  },
};
