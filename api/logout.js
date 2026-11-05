const { json, clearSession, sameOrigin } = require('./_lib');
module.exports = function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
  if (!sameOrigin(req)) return json(res, 403, { error: 'İstek kaynağı doğrulanamadı.' });
  clearSession(res);
  json(res, 200, { ok: true });
};
