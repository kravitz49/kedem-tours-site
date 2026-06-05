const BASE = 'https://kedem-tours.com';

let _token = '';
export const setToken = (t) => { _token = t; };
export const getToken = () => _token;

function authHeaders() {
  return { 'Authorization': 'Bearer ' + _token, 'Content-Type': 'application/json' };
}

async function request(path, options = {}) {
  const res = await fetch(BASE + path, options);
  const text = await res.text();
  try { return JSON.parse(text); }
  catch { throw new Error('Ошибка сервера'); }
}

export const api = {
  login: (password) => request('/login.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  }),

  getOrders: () => request('/orders.php', { headers: authHeaders() }),

  deleteOrder: (id) => request(`/orders.php/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  }),

  getExcursions: () => request('/api/excursions.php'),

  createExcursion: (data) => request('/api/excursions.php', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  }),

  updateExcursion: (data) => request('/api/excursions.php', {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  }),

  deleteExcursion: (id) => request(`/api/excursions.php/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  }),

  getReviews: () => request('/reviews.php', { headers: authHeaders() }),

  updateReview: (data) => request('/reviews.php', {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  }),

  deleteReview: (id) => request(`/reviews.php/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  }),

  getSettings: () => request('/settings.php'),

  saveSettings: (data) => request('/settings.php', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  }),
};
