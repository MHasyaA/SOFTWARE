'use strict';
/* ═══════════════════════════════════════════════════════
   ANALYTICS PAGE — Figma style (Desktop 5)
   KPI metric cards + Donut chart + Line chart
═══════════════════════════════════════════════════════ */

var TrendPage = {
  _unsub: null,
  _chartDonut: null,
  _chartLine:  null,
  _chartBar:   null,

  render() {
    return `<div id="analyticsRoot" class="page-enter"></div>`;
  },

  mount() {
    this._draw(STATE.getState());
    this._unsub = STATE.subscribe(s => this._draw(s));
  },

  unmount() {
    if (this._unsub) this._unsub();
    if (this._chartDonut) { this._chartDonut.destroy(); this._chartDonut = null; }
    if (this._chartLine)  { this._chartLine.destroy();  this._chartLine  = null; }
    if (this._chartBar)   { this._chartBar.destroy();   this._chartBar   = null; }
  },

  _draw(state) {
    const root = document.getElementById('analyticsRoot');
    if (!root) return;

    const { units } = state;
    const isDark   = document.documentElement.getAttribute('data-theme') !== 'light';
    
    // OEE Dummy calculations
    const a = 94.2; 
    const p = 88.5; 
    const q = 99.1;
    const oee = (a * p * q) / 10000;

    root.innerHTML = `
      <div class="page-header">
        <div>
          <div style="font-size:18px;font-weight:800;color:var(--text-primary)">OEE Analytics</div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:3px">Overall Equipment Effectiveness Analysis</div>
        </div>
        <div style="font-size:11px;color:var(--text-muted)">Data dummy — Fase 1</div>
      </div>

      <!-- KPI metric cards -->
      <div class="analytics-kpi-row" style="display:grid; grid-template-columns:repeat(4, 1fr); gap:20px;">
        ${this._kpiCard('Availability', `${a}%`, '▲ 1.2%', 'up', 'Ratio Waktu Operasi')}
        ${this._kpiCard('Performance', `${p}%`, '▼ 0.5%', 'down', 'Kapasitas Produksi')}
        ${this._kpiCard('Quality', `${q}%`, '—', 'neutral', 'Produksi Udara Bersih')}
        ${this._kpiCard('Total OEE', `${oee.toFixed(1)}%`, '▲ 2.1%', 'up', 'Skor Akhir Sistem')}
      </div>

      <!-- Charts row -->
      <div class="analytics-charts-row" style="display:grid; grid-template-columns:1fr 1.5fr 1fr; gap:20px;">
        
        <!-- Bar Chart: Availability -->
        <div class="analytics-chart-card">
          <div class="analytics-chart-title">Availability per Area</div>
          <div class="analytics-chart-wrap">
            <canvas id="chartAvail"></canvas>
          </div>
        </div>

        <!-- Line chart: Performance Trend -->
        <div class="analytics-chart-card">
          <div class="analytics-chart-title">Trend Performance (7 Hari Terakhir)</div>
          <div class="analytics-chart-wrap">
            <canvas id="chartPerf"></canvas>
          </div>
        </div>

        <!-- Donut chart: Quality -->
        <div class="analytics-chart-card">
          <div class="analytics-chart-title">Rasio Kualitas Produksi</div>
          <div class="analytics-chart-wrap">
            <canvas id="chartQual"></canvas>
          </div>
        </div>

      </div>
    `;

    this._buildBar(isDark);
    this._buildLine(isDark);
    this._buildDonut(isDark);
  },

  _kpiCard(label, value, delta, deltaType, sub) {
    const deltaClass = deltaType === 'down' ? 'delta-down'
      : deltaType === 'up'   ? 'delta-up'
      : 'delta-neutral';
    return `
      <div class="analytics-kpi-card">
        <div class="analytics-kpi-label">${label}</div>
        <div class="analytics-kpi-value">${value}</div>
        ${delta ? `<div class="analytics-kpi-delta ${deltaClass}">${delta}</div>` : ''}
        <div style="font-size:10px;color:var(--text-muted)">${sub}</div>
      </div>`;
  },

  _buildBar(isDark) {
    if (this._chartBar) { this._chartBar.destroy(); this._chartBar = null; }
    const ctx = document.getElementById('chartAvail');
    if (!ctx) return;

    const labels = ['Factory', 'Utility', 'Packaging'];
    const data = [96.5, 92.0, 88.5];
    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(44,62,80,0.08)';
    const textColor = isDark ? '#9ea8ba' : '#4a637a';

    this._chartBar = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: ['#3b82f6', '#8b5cf6', '#10b981'],
          borderRadius: 4
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: textColor, font: {size: 10} } },
          y: { grid: { color: gridColor }, ticks: { color: textColor, font: {size: 10} }, min: 80, max: 100 }
        }
      }
    });
  },

  _buildDonut(isDark) {
    if (this._chartDonut) { this._chartDonut.destroy(); this._chartDonut = null; }
    const ctx = document.getElementById('chartQual');
    if (!ctx) return;

    const labels = ['Standard (Good)', 'Reject (Bad)'];
    const data   = [99.1, 0.9];
    const textColor = isDark ? '#9ea8ba' : '#4a637a';

    this._chartDonut = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: ['#22d3ee', '#f87171'],
          borderWidth: 2,
          borderColor: isDark ? '#1e1e3a' : '#fff'
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: textColor, padding: 15, font: { size: 10, weight: '600' }, boxWidth: 10 }
          }
        }
      }
    });
  },

  _buildLine(isDark) {
    if (this._chartLine) { this._chartLine.destroy(); this._chartLine = null; }
    const ctx = document.getElementById('chartPerf');
    if (!ctx) return;

    const days  = ['Sen','Sel','Rab','Kam','Jum','Sab','Min'];
    const perfD = [84, 86, 85, 88, 87, 89, 88.5];

    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(44,62,80,0.08)';
    const textColor = isDark ? '#9ea8ba' : '#4a637a';

    this._chartLine = new Chart(ctx, {
      type: 'line',
      data: {
        labels: days,
        datasets: [{
          label: 'Performance (%)',
          data: perfD,
          borderColor: '#fb923c',
          backgroundColor: 'rgba(251,146,60,0.08)',
          tension: 0.4, fill: true,
          pointBackgroundColor: '#fb923c',
          pointRadius: 4, pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: textColor, font: { size: 10 } } },
          y: { grid: { color: gridColor }, ticks: { color: textColor, font: { size: 10 } }, min: 80, max: 100 }
        }
      }
    });
  }
};
