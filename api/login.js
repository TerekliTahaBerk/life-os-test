const crypto = require('crypto');
const { env, json, setSession, sameOrigin } = require('./_lib');
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
  if (!sameOrigin(req)) return json(res, 403, { error: 'İstek kaynağı doğrulanamadı.' });
  const expected = env('DASHBOARD_PASSWORD');
  if (!expected || !env('SESSION_SECRET')) return json(res, 503, { error: 'Panel kurulumu tamamlanmamış. DASHBOARD_PASSWORD ve SESSION_SECRET ayarla.' });
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  const provided = String(body?.password || '');
  const a = Buffer.from(provided), b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return json(res, 401, { error: 'Parola doğru değil.' });
  setSession(res);
  json(res, 200, { ok: true });
};
