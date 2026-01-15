const BASE_URL = '/api';

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
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
};
