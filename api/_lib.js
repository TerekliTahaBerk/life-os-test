const crypto = require('crypto');

const b64 = value => Buffer.from(value).toString('base64url');
function env(name) { return String(process.env[name] || '').trim(); }
function hmac(value) { return crypto.createHmac('sha256', env('SESSION_SECRET')).update(value).digest('base64url'); }
function cookie(req, name) {
  const raw = req.headers.cookie || '';
  const item = raw.split(';').map(x => x.trim()).find(x => x.startsWith(`${name}=`));
  return item ? decodeURIComponent(item.slice(name.length + 1)) : '';
}
function makeSession() {
  const payload = b64(JSON.stringify({ exp: Date.now() + 7 * 86400000 }));
  return `${payload}.${hmac(payload)}`;
}
function validSession(req) {
  if (!env('SESSION_SECRET')) return false;
  const token = cookie(req, 'lifeos_session');
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;
  const expected = hmac(payload);
  const a = Buffer.from(signature), b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  try { return JSON.parse(Buffer.from(payload, 'base64url').toString()).exp > Date.now(); } catch { return false; }
}
function setSession(res) {
  res.setHeader('Set-Cookie', `lifeos_session=${encodeURIComponent(makeSession())}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`);
}
function clearSession(res) {
  res.setHeader('Set-Cookie', 'lifeos_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0');
}
function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}
function requireAuth(req, res) {
  if (!validSession(req)) { json(res, 401, { error: 'Oturumun sona erdi. Yeniden giriş yap.' }); return false; }
  return true;
}
function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  try { return new URL(origin).host === req.headers.host; } catch { return false; }
}
function sheetReady() { return ['GOOGLE_SERVICE_ACCOUNT_EMAIL', 'GOOGLE_PRIVATE_KEY', 'GOOGLE_SHEET_ID'].every(env); }
let googleTokenCache = null;
async function googleToken() {
  if (googleTokenCache && googleTokenCache.until > Date.now() + 60000) return googleTokenCache.value;
  const email = env('GOOGLE_SERVICE_ACCOUNT_EMAIL');
  const key = env('GOOGLE_PRIVATE_KEY').replace(/\\n/g, '\n');
  const now = Math.floor(Date.now() / 1000);
  const assertion = `${b64(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))}.${b64(JSON.stringify({ iss: email, scope: 'https://www.googleapis.com/auth/spreadsheets', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 }))}`;
  const signer = crypto.createSign('RSA-SHA256'); signer.update(assertion);
  const signed = `${assertion}.${signer.sign(key, 'base64url')}`;
  const response = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: signed }) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error_description || data.error || 'Google yetkilendirmesi başarısız.');
  googleTokenCache = { value: data.access_token, until: Date.now() + (data.expires_in || 3600) * 1000 };
  return data.access_token;
}
const column = n => { let s = ''; for (n++; n; n = Math.floor((n - 1) / 26)) s = String.fromCharCode((n - 1) % 26 + 65) + s; return s; };
async function sheetRequest(tab, range = 'A1:Z1000', write) {
  const token = await googleToken();
  const encodedRange = encodeURIComponent(`'${tab}'!${range}`);
  const base = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(env('GOOGLE_SHEET_ID'))}/values/${encodedRange}`;
  const response = await fetch(write ? `${base}?valueInputOption=RAW` : `${base}?valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=SERIAL_NUMBER`, { method: write ? 'PUT' : 'GET', headers: { Authorization: `Bearer ${token}`, ...(write ? { 'Content-Type': 'application/json' } : {}) }, ...(write ? { body: JSON.stringify({ values: [[write.value]] }) } : {}) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || `Google Sheets isteği başarısız (${response.status}).`);
  return data.values || [];
}
function rowsToObjects(rows) {
  if (!rows?.length) return [];
  const headers = rows[0].map(x => String(x || '').trim());
  const dateColumns = headers.map((key, i) => /^(date|due_date|completed_at|created_at|datetime|timestamp)$/i.test(key) ? i : -1).filter(i => i >= 0);
  return rows.slice(1).map((row, index) => {
    const item = { _row: index + 2 };
    headers.forEach((key, i) => {
      if (!key) return;
      let value = row[i] ?? '';
      if (dateColumns.includes(i) && typeof value === 'number') {
        const date = new Date(Date.UTC(1899, 11, 30) + value * 86400000);
        value = /^(date|due_date)$/i.test(key) ? date.toISOString().slice(0, 10) : date.toISOString();
      }
      item[key] = value;
    });
    return item;
  }).filter(item => Object.keys(item).some(k => k !== '_row' && item[k] !== ''));
}
async function readTab(tab) { return rowsToObjects(await sheetRequest(tab)); }
function cleanTab(name) { return String(name || '').replace(/[\x00-\x1f'!]/g, '').slice(0, 80); }
module.exports = { env, json, requireAuth, setSession, clearSession, sameOrigin, sheetReady, sheetRequest, readTab, cleanTab, column };
