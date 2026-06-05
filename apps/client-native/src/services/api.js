const BASE = 'https://kedem-tours.com';

async function request(path, options = {}) {
  const res = await fetch(BASE + path, options);
  const text = await res.text();
  try { return JSON.parse(text); }
  catch { throw new Error('Ошибка сервера'); }
}

export const api = {
  getSettings: () => request('/settings.php'),

  getExcursions: () => request('/api/excursions.php'),

  submitOrder: (data) => request('/order.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),

  getReviews: () => request('/reviews.php'),

  submitReview: (data) => request('/reviews.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
};
