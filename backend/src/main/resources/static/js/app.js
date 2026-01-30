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
  renderChef,
  renderWaiter,
  renderAdmin,
  showToast,
  showModal,
  closeModal,
  setLoading,
} from './ui.js';

const root = document.getElementById('app');

const PAID_ORDERS_KEY = 'paidOrders';
const COMPLETED_ORDERS_KEY = 'completedOrders';

const state = {
  isAuthenticated: false,
  loginError: '',
  userRole: 'guest',
  menuItems: [],
  cart: [],
  reservationResult: null,
  orderResult: null,
  lookupReservations: [],
  lookupOrders: [],
  paidOrders: [],
  completedOrders: [],
  chefOrders: [],
  waiterOrders: [],
  waiterReservations: [],
  adminMenuItems: [],
  adminOrders: [],
  adminReservations: [],
};

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.warn('LocalStorage konnte nicht gelesen werden.', { key, error });
    return fallback;
  }
}

function saveJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('LocalStorage konnte nicht gespeichert werden.', { key, error });
  }
}

state.paidOrders = loadJson(PAID_ORDERS_KEY, []);
state.completedOrders = loadJson(COMPLETED_ORDERS_KEY, []);

function setRole(role) {
  state.userRole = role;
  document.body.classList.toggle('role-chef', role === 'chef');
  document.body.classList.toggle('role-waiter', role === 'waiter');
  document.body.classList.toggle('role-admin', role === 'admin');
}

function markOrderPaid(order) {
  if (!order) return null;
  const updated = { ...order, status: 'PAID_DEMO' };
  const snapshot = {
    id: updated.id,
    reservationId: updated.reservationId ?? null,
    customerName: updated.customerName,
    createdAt: updated.createdAt,
    total: updated.total,
    items: updated.items,
    status: updated.status,
    paidAt: new Date().toISOString(),
  };
  const index = state.paidOrders.findIndex((entry) => entry.id === updated.id);
  if (index >= 0) {
    state.paidOrders[index] = { ...state.paidOrders[index], ...snapshot };
  } else {
    state.paidOrders.push(snapshot);
  }
  saveJson(PAID_ORDERS_KEY, state.paidOrders);
  return updated;
}

function markOrderDone(id) {
  if (!state.completedOrders.includes(id)) {
    state.completedOrders.push(id);
    saveJson(COMPLETED_ORDERS_KEY, state.completedOrders);
  }
}

function parseTime(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.getTime();
}

function sortChefOrders(list) {
  return list.slice().sort((a, b) => {
    const aRes = parseTime(a.reservation?.dateTimeStart) ?? Number.MAX_SAFE_INTEGER;
    const bRes = parseTime(b.reservation?.dateTimeStart) ?? Number.MAX_SAFE_INTEGER;
    if (aRes !== bRes) {
      return aRes - bRes;
    }
    const aCreated = parseTime(a.createdAt) ?? 0;
    const bCreated = parseTime(b.createdAt) ?? 0;
    return aCreated - bCreated;
  });
}

async function loadChefOrders() {
  const paidOrders = Array.isArray(state.paidOrders) ? state.paidOrders : [];
  const enriched = await Promise.all(paidOrders.map(async (order) => {
    let reservation = null;
    if (order.reservationId) {
      try {
        reservation = await api.getReservation(order.reservationId);
      } catch (error) {
        console.warn('Reservierung konnte nicht geladen werden.', { orderId: order.id, error });
      }
    }
    return { ...order, reservation };
  }));
  state.chefOrders = sortChefOrders(enriched);
}

async function loadWaiterOrders() {
  const paidOrders = Array.isArray(state.paidOrders) ? state.paidOrders : [];
  const enriched = await Promise.all(paidOrders.map(async (order) => {
    let reservation = null;
    if (order.reservationId) {
      try {
        reservation = await api.getReservation(order.reservationId);
      } catch (error) {
        console.warn('Reservierung konnte nicht geladen werden.', { orderId: order.id, error });
      }
    }
    return { ...order, reservation };
  }));
  state.waiterOrders = sortChefOrders(enriched);
}

async function loadWaiterReservations() {
  try {
    state.waiterReservations = await api.getAllReservations();
  } catch (error) {
    console.warn('Reservierungen konnten nicht geladen werden.', { error });
    state.waiterReservations = [];
  }
}

async function loadAdminData() {
  try {
    const [menuItems, orders, reservations] = await Promise.all([
      api.getMenu(),
      api.getAllOrders(),
      api.getAllReservations(),
    ]);
    state.adminMenuItems = Array.isArray(menuItems) ? menuItems : [];
    state.adminOrders = Array.isArray(orders) ? orders : [];
    state.adminReservations = Array.isArray(reservations) ? reservations : [];
  } catch (error) {
    console.warn('Admin-Daten konnten nicht geladen werden.', { error });
    state.adminMenuItems = [];
    state.adminOrders = [];
    state.adminReservations = [];
  }
}

let menuLoadPromise = null;
let menuLoaded = false;

async function fetchMenu() {
  if (menuLoadPromise) {
    return menuLoadPromise;
  }
  menuLoadPromise = (async () => {
    setLoading(true);
    try {
      const data = await api.getMenu();
      state.menuItems = Array.isArray(data) ? data : [];
      menuLoaded = true;
      return state.menuItems;
    } catch (error) {
      state.menuItems = [];
      showToast('Menü konnte nicht geladen werden.', 'error');
      return state.menuItems;
    } finally {
      setLoading(false);
      menuLoadPromise = null;
    }
  })();
  return menuLoadPromise;
}

const actions = {
  onLogin: async (payload) => {
    setLoading(true);
    try {
      const result = await api.login(payload);
      state.isAuthenticated = true;
      state.loginError = '';
      const role = result?.role || 'customer';
      const isChef = role === 'chef';
      const isWaiter = role === 'waiter';
      const isAdmin = role === 'admin';
      setRole(isChef ? 'chef' : isWaiter ? 'waiter' : isAdmin ? 'admin' : 'customer');
      if (isChef) {
        await loadChefOrders();
        navigate('/chef');
        return;
      }
      if (isWaiter) {
        await Promise.all([loadWaiterOrders(), loadWaiterReservations()]);
        navigate('/waiter');
        return;
      }
      if (isAdmin) {
        await loadAdminData();
        navigate('/admin');
        return;
      }
      await fetchMenu();
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
      const reservationDate = formatReservationDate(reservation.dateTimeStart);
      const reservationTime = formatReservationTime(reservation.dateTimeStart);
      const nameLine = reservation.customerName ? `\nName: ${reservation.customerName}` : '';
      alert(`Reservierung bestätigt!\nDatum: ${reservationDate}\nUhrzeit: ${reservationTime}\nPersonen: ${reservation.persons}${nameLine}`);
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
  onPayOrder: async (id) => {
    const order = state.orderResult?.id === id
      ? state.orderResult
      : state.lookupOrders.find((entry) => entry.id === id);
    if (!order) {
      showToast('Bestellung nicht gefunden.', 'error');
      return;
    }
    const updated = markOrderPaid(order);
    if (updated && state.orderResult?.id === updated.id) {
      state.orderResult = updated;
    }
    state.lookupOrders = state.lookupOrders.map((entry) => (updated && entry.id === updated.id ? updated : entry));

    showModal(`
      <h2 class="section-title">Zahlung angenommen (Demo)</h2>
      <p class="text-muted">Bestellung #${order.id} wurde als angenommen markiert.</p>
      <button class="btn" id="paymentClose">OK</button>
    `);
    document.getElementById('paymentClose')?.addEventListener('click', closeModal);
    showToast(`Zahlung für Bestellung #${order.id} angenommen (Demo).`);
    handleRoute();
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
        const updated = markOrderPaid(order);
        if (updated && state.orderResult?.id === updated.id) {
          state.orderResult = updated;
        }
        state.lookupOrders = state.lookupOrders.map((entry) => (updated && entry.id === updated.id ? updated : entry));
        showModal(`
          <h2 class="section-title">Zahlung angenommen (Demo)</h2>
          <p class="text-muted">Bestellung #${order.id} wurde als angenommen markiert.</p>
          <button class="btn" id="paymentClose">OK</button>
        `);
        document.getElementById('paymentClose')?.addEventListener('click', closeModal);
        showToast(`Zahlung für Bestellung #${order.id} angenommen (Demo).`);
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
  onAdminRefresh: async () => {
    setLoading(true);
    try {
      await loadAdminData();
      showToast('Admin-Daten aktualisiert.');
      handleRoute();
    } catch (error) {
      showToast('Admin-Daten konnten nicht geladen werden.', 'error');
    } finally {
      setLoading(false);
    }
  },
  onAdminCreateMenuItem: async (payload) => {
    setLoading(true);
    try {
      await api.createMenuItem(payload);
      await loadAdminData();
      showToast('Menüeintrag erstellt.');
      handleRoute();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  },
  onAdminDeleteMenuItem: async (id) => {
    setLoading(true);
    try {
      await api.deleteMenuItem(id);
      await loadAdminData();
      showToast('Menüeintrag gelöscht.');
      handleRoute();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  },
  onAdminDeleteAllMenuItems: async () => {
    setLoading(true);
    try {
      await api.deleteAllMenuItems();
      await loadAdminData();
      showToast('Alle Menüeinträge gelöscht.');
      handleRoute();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  },
  onAdminDeleteOrder: async (id) => {
    setLoading(true);
    try {
      await api.deleteOrder(id);
      await loadAdminData();
      showToast('Bestellung gelöscht.');
      handleRoute();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  },
  onAdminDeleteAllOrders: async () => {
    setLoading(true);
    try {
      await api.deleteAllOrders();
      state.paidOrders = [];
      state.completedOrders = [];
      saveJson(PAID_ORDERS_KEY, state.paidOrders);
      saveJson(COMPLETED_ORDERS_KEY, state.completedOrders);
      await loadAdminData();
      showToast('Alle Bestellungen gelöscht.');
      handleRoute();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  },
  onAdminDeleteReservation: async (id) => {
    setLoading(true);
    try {
      await api.deleteReservation(id);
      await loadAdminData();
      showToast('Reservierung gelöscht.');
      handleRoute();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  },
  onAdminDeleteAllReservations: async () => {
    setLoading(true);
    try {
      await api.deleteAllReservations();
      await loadAdminData();
      showToast('Alle Reservierungen gelöscht.');
      handleRoute();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  },
  onAdminDeleteEverything: async () => {
    setLoading(true);
    try {
      await Promise.all([
        api.deleteAllMenuItems(),
        api.deleteAllOrders(),
        api.deleteAllReservations(),
      ]);
      state.paidOrders = [];
      state.completedOrders = [];
      saveJson(PAID_ORDERS_KEY, state.paidOrders);
      saveJson(COMPLETED_ORDERS_KEY, state.completedOrders);
      await loadAdminData();
      showToast('Alles gelöscht.');
      handleRoute();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  },
  onMarkOrderDone: (id) => {
    markOrderDone(id);
    showToast('Bestellung als fertig markiert.');
    handleRoute();
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

  const chefGuard = (renderer) => () => {
    if (!state.isAuthenticated) {
      navigate('/login');
      return;
    }
    if (state.userRole !== 'chef') {
      navigate('/home');
      return;
    }
    renderer();
  };

  const waiterGuard = (renderer) => () => {
    if (!state.isAuthenticated) {
      navigate('/login');
      return;
    }
    if (state.userRole !== 'waiter') {
      navigate('/home');
      return;
    }
    renderer();
  };

  const adminGuard = (renderer) => () => {
    if (!state.isAuthenticated) {
      navigate('/login');
      return;
    }
    if (state.userRole !== 'admin') {
      navigate('/home');
      return;
    }
    renderer();
  };

  registerRoute('/login', () => renderLogin(root, state, actions));
  registerRoute('/home', guarded(() => renderHome(root)));
  registerRoute('/menu', guarded(async () => {
    if (!menuLoaded) {
      await fetchMenu();
    }
    renderMenu(root, state, actions);
  }));
  registerRoute('/reservation', guarded(() => renderReservation(root, state, actions)));
  registerRoute('/order', guarded(() => renderOrder(root, state, actions)));
  registerRoute('/lookup', guarded(() => renderLookup(root, state, actions)));
  registerRoute('/chef', chefGuard(async () => {
    await loadChefOrders();
    renderChef(root, state, actions);
  }));
  registerRoute('/waiter', waiterGuard(async () => {
    await Promise.all([loadWaiterOrders(), loadWaiterReservations()]);
    renderWaiter(root, state, actions);
  }));
  registerRoute('/admin', adminGuard(async () => {
    await loadAdminData();
    renderAdmin(root, state, actions);
  }));
  registerRoute('/contact', guarded(() => renderContact(root)));

  setupModal();
  setupNav();
  initRouter();

  if (!window.location.hash || !state.isAuthenticated) {
    navigate('/login');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
