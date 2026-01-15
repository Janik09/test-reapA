import { api } from './api.js';
import { registerRoute, initRouter, handleRoute, navigate } from './router.js';
import {
  renderHome,
  renderMenu,
  renderReservation,
  renderOrder,
  renderLookup,
  renderContact,
  showToast,
  showModal,
  closeModal,
  setLoading,
} from './ui.js';

const root = document.getElementById('app');

const state = {
  menuItems: [],
  cart: [],
  reservationResult: null,
  orderResult: null,
  lookupReservations: [],
  lookupOrders: [],
};

const actions = {
  onAddToCart: (id) => {
    const item = state.menuItems.find((entry) => entry.id === id);
    if (!item) return;
    const existing = state.cart.find((entry) => entry.id === id);
    if (existing) {
      existing.quantity += 1;
    } else {
      state.cart.push({ id: item.id, name: item.name, price: item.price, quantity: 1 });
    }
    showToast(`${item.name} wurde zum Warenkorb hinzugefügt.`);
    handleRoute();
  },
  onShowDetail: (id) => {
    const item = state.menuItems.find((entry) => entry.id === id);
    if (!item) return;
    showModal(`
      <h2>${item.name}</h2>
      <p>${item.description}</p>
      <p><strong>${item.price.toFixed(2)} €</strong></p>
      <p>Kategorie: ${item.category}</p>
      <button class="btn" id="modalAdd">In den Warenkorb</button>
    `);
    document.getElementById('modalAdd').addEventListener('click', () => {
      actions.onAddToCart(id);
      closeModal();
    });
  },
  onCreateReservation: async (payload) => {
    setLoading(true);
    try {
      const reservation = await api.createReservation(payload);
      state.reservationResult = reservation;
      showToast(`Reservierung bestätigt! Tisch ${reservation.tableName}.`);
      handleRoute();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  },
  onUpdateQuantity: (id, delta) => {
    const item = state.cart.find((entry) => entry.id === id);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) {
      state.cart = state.cart.filter((entry) => entry.id !== id);
    }
    handleRoute();
  },
  onRemoveFromCart: (id) => {
    state.cart = state.cart.filter((entry) => entry.id !== id);
    handleRoute();
  },
  onCreateOrder: async (payload) => {
    setLoading(true);
    try {
      const order = await api.createOrder(payload);
      state.orderResult = order;
      state.cart = [];
      showToast(`Bestellung #${order.id} wurde angelegt.`);
      handleRoute();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  },
  onLookup: async (contact) => {
    setLoading(true);
    try {
      const [reservations, orders] = await Promise.all([
        api.getReservations(contact),
        api.getOrders(contact),
      ]);
      state.lookupReservations = reservations;
      state.lookupOrders = orders;
      showToast('Suchergebnisse aktualisiert.');
      handleRoute();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  },
  onPayOrder: async (id) => {
    setLoading(true);
    try {
      const order = await api.payOrder(id);
      state.lookupOrders = state.lookupOrders.map((entry) => (entry.id === order.id ? order : entry));
      showToast(`Bestellung #${order.id} ist bezahlt.`);
      handleRoute();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  },
};

function setupModal() {
  const modal = document.getElementById('modal');
  const closeButton = document.getElementById('modalClose');
  closeButton.addEventListener('click', closeModal);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });
}

function setupNav() {
  const header = document.getElementById('siteHeader');
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('siteNav');
  if (!header || !toggle || !nav) return;

  toggle.addEventListener('click', () => {
    header.classList.toggle('site-header--open');
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      header.classList.remove('site-header--open');
    });
  });
}

async function init() {
  setLoading(true);
  try {
    state.menuItems = await api.getMenu();
  } catch (error) {
    showToast('Menü konnte nicht geladen werden.', 'error');
  } finally {
    setLoading(false);
  }

  registerRoute('/home', () => renderHome(root));
  registerRoute('/menu', () => renderMenu(root, state, actions));
  registerRoute('/reservation', () => renderReservation(root, state, actions));
  registerRoute('/order', () => renderOrder(root, state, actions));
  registerRoute('/lookup', () => renderLookup(root, state, actions));
  registerRoute('/contact', () => renderContact(root));

  setupModal();
  setupNav();
  initRouter();

  if (!window.location.hash) {
    navigate('/home');
  }
}

init();
