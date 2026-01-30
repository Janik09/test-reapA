import { api } from './api.js';
import { registerRoute, initRouter, handleRoute, navigate } from './router.js';
import { renderMenu } from './menu.js';
import {
  renderHome,
  renderLogin,
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
  isAuthenticated: false,
  loginError: '',
  menuItems: [],
  cart: [],
  reservationResult: null,
  orderResult: null,
  lookupReservations: [],
  lookupOrders: [],
};

async function loadMenu() {
  setLoading(true);
  try {
    state.menuItems = await api.getMenu();
  } catch (error) {
    showToast('Menü konnte nicht geladen werden.', 'error');
  } finally {
    setLoading(false);
  }
}

const actions = {
  onLogin: async (payload) => {
    setLoading(true);
    try {
      await api.login(payload);
      state.isAuthenticated = true;
      state.loginError = '';
      await loadMenu();
      navigate('/home');
    } catch (error) {
      state.loginError = 'Wrong username or password. Try again.';
      handleRoute();
    } finally {
      setLoading(false);
    }
  },
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
      alert(`Reservierung bestätigt! 
Datum: $\{formatReservationDate(reservation.date TimeStart)}
Uhrzeit: ${formatReservationTime(reservation.dateTimeStart)}\nPersonen: ${reservation.persons}\nName: ${reservation.customerName}`);
      showToast(`Reservierung bestätigt! Tisch ${reservation.tableName}.`);
      handleRoute();
    } catch (error) {
      alert(`Reservierung fehlgeschlagen: ${error.message}`);
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
  onStartPayment: (id) => {
    const order = state.orderResult?.id === id
        ? state.orderResult
        : state.lookupOrders.find((entry) => entry.id === id);
    if (!order) {
      showToast('Bestellung nicht gefunden.', 'error');
      return;
    }

    showModal(buildPaymentForm(order));
    const form = document.getElementById('paymentForm');
    if (!form) return;
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const name = form.paymentName.value.trim();
      const cardNumber = form.paymentCard.value.replace(/\s+/g, '');
      const expiry = form.paymentExpiry.value.trim();
      const cvc = form.paymentCvc.value.trim();
      const error = validatePaymentForm({ name, cardNumber, expiry, cvc });
      const errorField = form.querySelector('#paymentError');
      if (errorField) {
        errorField.textContent = error || '';
      }
      if (error) {
        return;
      }
      setLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const updated = await api.payOrderMock(order.id);
        if (state.orderResult?.id === updated.id) {
          state.orderResult = updated;
        }
        state.lookupOrders = state.lookupOrders.map((entry) => (entry.id === updated.id ? updated : entry));
        showToast(`Bestellung #${updated.id} ist bezahlt (Mock).`);
        closeModal();
        handleRoute();
      } catch (error) {
        showToast(error.message, 'error');
      } finally {
        setLoading(false);
      }
    });
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
};
function buildPaymentForm(order) {
  return `
    <h2 class="section-title">Online bezahlen (Mock)</h2>
    <p class="text-muted">Bestellung #${order.id} – Gesamt: ${order.total.toFixed(2)} €</p>
    <form id="paymentForm">
      <div class="form-group">
        <label for="paymentName">Name auf der Karte</label>
        <input id="paymentName" name="paymentName" type="text" required />
      </div>
      <div class="form-group">
        <label for="paymentCard">Kartennummer</label>
        <input id="paymentCard" name="paymentCard" type="text" placeholder="1234 5678 9012 3456" required />
      </div>
      <div class="form-group">
        <label for="paymentExpiry">Ablaufdatum</label>
        <input id="paymentExpiry" name="paymentExpiry" type="text" placeholder="MM/JJ" required />
      </div>
      <div class="form-group">
        <label for="paymentCvc">CVC</label>
        <input id="paymentCvc" name="paymentCvc" type="text" placeholder="123" required />
      </div>
      <p class="form-error" id="paymentError"></p>
      <button class="btn" type="submit">Zahlung abschicken</button>
    </form>
  `;
}

function validatePaymentForm({ name, cardNumber, expiry, cvc }) {
  if (!name) return 'Name ist erforderlich.';
  if (!/^[0-9]{12,19}$/.test(cardNumber)) return 'Kartennummer ist ungültig.';
  if (!/^(0[1-9]|1[0-2])\/(\\d{2}|\\d{4})$/.test(expiry)) return 'Ablaufdatum muss MM/JJ sein.';
  if (!/^[0-9]{3,4}$/.test(cvc)) return 'CVC ist ungültig.';
  return '';
}

function formatReservationDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('de-DE');
}

function formatReservationTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

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
  const guarded = (renderer) => () => {
    if (!state.isAuthenticated) {
      navigate('/login');
      return;
    }
    renderer();
  };

  registerRoute('/login', () => renderLogin(root, state, actions));
  registerRoute('/home', guarded(() => renderHome(root)));
  registerRoute('/menu', guarded(() => renderMenu(root, state, actions)));
  registerRoute('/reservation', guarded(() => renderReservation(root, state, actions)));
  registerRoute('/order', guarded(() => renderOrder(root, state, actions)));
  registerRoute('/lookup', guarded(() => renderLookup(root, state, actions)));
  registerRoute('/contact', guarded(() => renderContact(root)));

  setupModal();
  setupNav();
  initRouter();

  if (!window.location.hash || !state.isAuthenticated) {
    navigate('/login');
  }
}

init();
