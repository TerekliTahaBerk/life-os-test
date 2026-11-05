const { env, json, requireAuth, sheetReady, readTab } = require('./_lib');
module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed' });
  if (!requireAuth(req, res)) return;
  const result = { configured: sheetReady() && !!env('FREDDY_API_KEY'), expenses: [], meals: [], tasks: [], health: { data: [], meta: null }, errors: {}, updatedAt: new Date().toISOString() };
  const jobs = [];
  if (sheetReady()) {
    jobs.push(Promise.all([readTab('Expenses'), readTab('Meals'), readTab('Tasks')]).then(([expenses, meals, tasks]) => { result.expenses = expenses; result.meals = meals; result.tasks = tasks; }).catch(e => { result.errors.sheets = e.message; }));
  } else result.errors.sheets = 'Google Sheets ortam değişkenleri ayarlanmamış.';
  if (env('FREDDY_API_KEY')) {
    const from = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
    jobs.push(fetch(`https://freddy.coach/api/v1/metrics?from=${from}&limit=500`, { headers: { Authorization: `Bearer ${env('FREDDY_API_KEY')}`, Accept: 'application/json' } }).then(async r => { const j = await r.json(); if (!r.ok) throw new Error(j.error || `Freddy API hatası (${r.status}).`); result.health = { data: j.data || [], meta: j.meta || null }; }).catch(e => { result.errors.freddy = e.message; }));
  } else result.errors.freddy = 'Freddy API anahtarı ayarlanmamış.';
  await Promise.all(jobs);
  result.configured = result.configured && !Object.keys(result.errors).length;
  json(res, 200, result);
};
