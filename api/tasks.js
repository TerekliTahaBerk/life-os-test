const { json, requireAuth, sameOrigin, sheetReady, readTab, sheetRequest, column } = require('./_lib');
module.exports = async function handler(req, res) {
  if (req.method !== 'PATCH') return json(res, 405, { error: 'Method not allowed' });
  if (!requireAuth(req, res)) return;
  if (!sameOrigin(req)) return json(res, 403, { error: 'İstek kaynağı doğrulanamadı.' });
  if (!sheetReady()) return json(res, 503, { error: 'Google Sheets bağlantısı kurulmamış.' });
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  const id = String(body?.id || '').trim();
  if (!id) return json(res, 400, { error: 'Görev kimliği eksik.' });
  try {
    const raw = await sheetRequest('Tasks');
    if (!raw.length) return json(res, 404, { error: 'Görev sekmesi boş.' });
    const headers = raw[0].map(x => String(x || '').trim());
    const idCol = headers.findIndex(x => ['id','task_id','task id','görev id'].includes(x.toLowerCase()));
    const statusCol = headers.findIndex(x => ['status','durum','state'].includes(x.toLowerCase()));
    if (idCol < 0 || statusCol < 0) return json(res, 400, { error: 'Tasks sekmesinde id ve status sütunları gerekli.' });
    const rowIndex = raw.slice(1).findIndex(row => String(row[idCol] || '') === id);
    if (rowIndex < 0) return json(res, 404, { error: 'Görev bulunamadı.' });
    const rowNumber = rowIndex + 2;
    const newStatus = body.done ? 'done' : 'open';
    await sheetRequest('Tasks', `${column(statusCol)}${rowNumber}`, { value: newStatus });
    return json(res, 200, { ok: true, id, status: newStatus });
  } catch (e) { return json(res, 502, { error: e.message || 'Görev güncellenemedi.' }); }
};
