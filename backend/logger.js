// logger.js
const fs = require('fs');
const path = require('path');

// Array în memorie pentru acces ultra-rapid
let logsMemory = [];
const LOGS_FILE = path.join(__dirname, 'logs.json');

// Încarcă logurile salvate anterior (dacă există fișierul) la pornirea serverului
if (fs.existsSync(LOGS_FILE)) {
  try {
    logsMemory = JSON.parse(fs.readFileSync(LOGS_FILE, 'utf8'));
  } catch (e) {
    logsMemory = [];
  }
}

// Funcție helper pentru salvare pe disc (opțional, ca să nu le pierzi la restart)
function saveLogsToDisk() {
  try {
    fs.writeFileSync(LOGS_FILE, JSON.stringify(logsMemory, null, 2));
  } catch (e) {
    console.error('Eroare la salvarea logurilor pe disc:', e);
  }
}

/**
 * Adaugă un log nou în sistem și șterge automat logurile mai vechi de 7 zile.
 * @param {string} type - 'INFO' | 'WARN' | 'ERROR'
 * @param {string} actionCode - 'LOGIN_SUCCESS' | 'ADMIN_AUTH_FAILED' etc.
 * @param {string} message - Detaliile logului
 */
function addLog(type, actionCode, message) {
  const now = new Date();
  
  // Formatare oră [HH:MM] conform cerinței tale
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;

  // Format final exact
  const logText = `[${timeStr}] [${type}] [${actionCode}] - ${message}`;

  const logEntry = {
    text: logText,
    timestampMs: now.getTime(), // Folosit pentru filtrarea de 7 zile
    createdAt: now.toISOString()
  };

  logsMemory.push(logEntry);

  // Curățare automată: eliminăm logurile mai vechi de 7 zile
  const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
  const expirationLimit = now.getTime() - sevenDaysInMs;

  logsMemory = logsMemory.filter(log => log.timestampMs >= expirationLimit);

  // Salvăm starea actualizată pe disc
  saveLogsToDisk();
}

function getLogs() {
  // Returnează logurile inversate (ultimele apărute să fie primele)
  return logsMemory.map(l => l.text).reverse();
}

module.exports = {
  addLog,
  getLogs
};