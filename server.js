'use strict';

const express  = require('express');
const path     = require('path');
const os       = require('os');

const app  = express();
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';

// ─── Serve static files from current directory ─────────────────────────────
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');
  // Force clear browser caches (only effective on HTTPS, but worth trying)
  // res.set('Clear-Site-Data', '"cache", "cookies", "storage"');
  next();
});

app.use(express.static(path.join(__dirname), {
  etag:        false,
  lastModified: false,
  maxAge:      0
}));

// ─── SPA fallback ─────────────────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ─── Start ────────────────────────────────────────────────────────────────
app.listen(PORT, HOST, () => {
  const ips = getLocalIPs();

  console.log('\n');
  console.log('  ╔══════════════════════════════════════════════════╗');
  console.log('  ║   BMC Air Compressor Management System  v1.0    ║');
  console.log('  ╠══════════════════════════════════════════════════╣');
  console.log(`  ║   Local:    http://localhost:${PORT}               ║`);
  ips.forEach(ip => {
  const line = `  ║   Network:  http://${ip}:${PORT}`;
  const padded = line.padEnd(52) + '║';
  console.log(padded);
  });
  console.log('  ╚══════════════════════════════════════════════════╝');
  console.log('\n  WebSocket Node-RED: ws://localhost:1880/ws/dashboard');
  console.log('  Mode: MOCK DATA (aktif jika Node-RED tidak terhubung)\n');
});

// ─── Get all local IPv4 addresses ─────────────────────────────────────────
function getLocalIPs() {
  const nets   = os.networkInterfaces();
  const result = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        result.push(net.address);
      }
    }
  }
  return result.length ? result : ['localhost'];
}
