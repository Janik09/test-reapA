const apiBaseMeta = document.querySelector('meta[name="api-base"]');
const BASE_URL = apiBaseMeta?.getAttribute('content')?.trim() || '/api';

function buildUrl(path) {
  const normalizedBase = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

async function request(path, options = {}) {
  const url = buildUrl(path);
  let response;
  try {
    response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch (error) {
    console.error('API request failed (network error).', { url, error });
    throw error;
  }

  console.info('API response received.', { url, status: response.status });

  if (!response.ok) {
    console.error('API request failed.', {
      url,
      status: response.status,
      statusText: response.statusText,
    });
    let message = 'Unbekannter Fehler';
    try {
      const body = await response.json();
      message = body.message || message;
    } catch (error) {
      // ignore
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const api = {
  getMenu: () => request('/menu'),
  getMenuItem: (id) => request(`/menu/${id}`),
  getTables: () => request('/tables'),
  createReservation: (payload) => request('/reservations', { method: 'POST', body: JSON.stringify(payload) }),
  getReservations: (contact) => request(`/reservations?contact=${encodeURIComponent(contact)}`),
  getReservation: (id) => request(`/reservations/${id}`),
  createOrder: (payload) => request('/orders', { method: 'POST', body: JSON.stringify(payload) }),
  getOrders: (contact) => request(`/orders?contact=${encodeURIComponent(contact)}`),
  getOrder: (id) => request(`/orders/${id}`),
  payOrder: (id) => request(`/orders/${id}/pay`, { method: 'POST' }),
  login: async (payload) => {
    const url = buildUrl('/auth/login');
    let response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error('API login failed (network error).', { url, error });
      throw error;
    }
    console.info('API response received.', { url, status: response.status });
    if (!response.ok) {
      console.error('API login failed.', {
        url,
        status: response.status,
        statusText: response.statusText,
      });
    }
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(body.status || 'error');
    }
    return body;
  },
};
