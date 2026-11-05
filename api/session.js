const { json, validSession } = (() => {
  const lib = require('./_lib');
  return { ...lib, validSession: undefined };
})();
const { env } = require('./_lib');
module.exports = function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed' });
  const authenticated = (() => {
    const token = (req.headers.cookie || '').split(';').map(x => x.trim()).find(x => x.startsWith('lifeos_session='))?.slice('lifeos_session='.length);
    if (!token || !env('SESSION_SECRET')) return false;
    const crypto = require('crypto');
    const [payload, sig] = decodeURIComponent(token).split('.');
    if (!payload || !sig) return false;
    const expected = crypto.createHmac('sha256', env('SESSION_SECRET')).update(payload).digest('base64url');
    const a = Buffer.from(sig), b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
    try { return JSON.parse(Buffer.from(payload, 'base64url').toString()).exp > Date.now(); } catch { return false; }
  })();
  json(res, 200, { authenticated });
};
