export function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.remove('toast--error', 'toast--success');
  toast.classList.add(`toast--${type}`, 'show');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.classList.remove('show'), 3000);
}

export function setLoading(isLoading) {
  const loading = document.getElementById('loading');
  loading.classList.toggle('hidden', !isLoading);
}

export function showModal(html) {
  const modal = document.getElementById('modal');
  const body = document.getElementById('modalBody');
  body.innerHTML = html;
  modal.classList.remove('hidden');
}

export function closeModal() {
  document.getElementById('modal').classList.add('hidden');
}

export function renderLogin(root, state, actions) {
  root.innerHTML = `
    <section class="grid grid--2">
      <div class="card">
        <h2 class="section-title">Login</h2>
        <form id="loginForm">
          <div class="form-group">
            <label for="loginUsername">Benutzername</label>
            <input id="loginUsername" type="text" required />
          </div>
          <div class="form-group">
            <label for="loginPassword">Passwort</label>
            <input id="loginPassword" type="password" required />
          </div>
          <p class="form-error" id="loginError">${state.loginError || ''}</p>
          <button class="btn" type="submit">Login</button>
        </form>
      </div>
      <div class="card">
        <h3 class="section-title">Willkommen zurück</h3>
        <p>Bitte melde dich an, um fortzufahren.</p>
      </div>
    </section>
  `;

  const form = root.querySelector('#loginForm');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    actions.onLogin({
      username: form.loginUsername.value.trim(),
      password: form.loginPassword.value,
    });
  });
}

export function renderHome(root) {
  root.innerHTML = `
    <section class="grid grid--2">
      <div class="card">
        <h2 class="section-title">Willkommen!</h2>
        <p>Plane deinen Restaurantbesuch entspannt: Reserviere einen Tisch, wähle Gerichte aus und bezahle online – alles an einem Ort.</p>
        <div class="grid">
          <a class="btn" href="#/reservation">Jetzt Tisch reservieren</a>
          <a class="btn btn--secondary" href="#/menu">Speisekarte ansehen</a>
        </div>
      </div>
      <div class="card">
        <h3 class="section-title">Was ist möglich?</h3>
        <ul>
          <li>Freie Tische automatisch zuweisen</li>
          <li>Gerichte filtern und vorbestellen</li>
          <li>Status deiner Bestellung verfolgen</li>
          <li>Mock-Payment für schnelle Bestätigung</li>
        </ul>
      </div>
    </section>
  `;
}

export function renderReservation(root, state, actions) {
  root.innerHTML = `
    <section class="grid grid--2">
      <div class="card">
        <h2 class="section-title">Tisch reservieren</h2>
        <form id="reservationForm">
          <div class="form-group">
            <label for="resName">Name</label>
            <input id="resName" type="text" required />
            <small class="form-error" data-error="resName"></small>
          </div>
          <div class="form-group">
            <label for="resContact">Telefon oder E-Mail</label>
            <input id="resContact" type="text" required />
            <small class="form-error" data-error="resContact"></small>
          </div>
          <div class="form-group">
            <label for="resDateTime">Datum &amp; Startzeit</label>
            <input id="resDateTime" type="datetime-local" required />
            <small class="form-error" data-error="resDateTime"></small>
          </div>
          <div class="form-group">
            <label for="resDuration">Dauer (Minuten)</label>
            <input id="resDuration" type="number" value="90" min="30" step="15" required />
            <small class="form-error" data-error="resDuration"></small>
          </div>
          <div class="form-group">
            <label for="resPersons">Personen</label>
            <input id="resPersons" type="number" value="2" min="1" required />
            <small class="form-error" data-error="resPersons"></small>
          </div>
          <button class="btn" type="submit" disabled>Reservierung anfragen</button>
        </form>
      </div>
      <div class="card" id="reservationResult">
        <h3 class="section-title">Bestätigung</h3>
        ${reservationGallery()}
        ${state.reservationResult ? reservationSummary(state.reservationResult) : '<p>Noch keine Reservierung erstellt.</p>'}
      </div>
    </section>
  `;

  const form = root.querySelector('#reservationForm');
  const submitButton = form.querySelector('button[type=\"submit\"]');
  const fields = Array.from(form.querySelectorAll('input'));

  const updateErrors = () => {
    fields.forEach((field) => {
      const error = form.querySelector(`[data-error=\"${field.id}\"]`);
      if (!error) return;
      error.textContent = field.validity.valid ? '' : field.validationMessage;
    });
    submitButton.disabled = !form.checkValidity();
  };

  fields.forEach((field) => field.addEventListener('input', updateErrors));
  updateErrors();
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const payload = {
      customerName: form.resName.value.trim(),
      contact: form.resContact.value.trim(),
      dateTimeStart: form.resDateTime.value,
      durationMinutes: Number(form.resDuration.value),
      persons: Number(form.resPersons.value),
    };
    actions.onCreateReservation(payload);
  });

  root.querySelectorAll('.reservation-media img[data-fallback]').forEach((image) => {
    image.addEventListener('error', () => {
      image.classList.add('hidden');
      const fallback = image.closest('.reservation-media__item')?.querySelector('.menu-card__fallback');
      if (fallback) {
        fallback.classList.remove('hidden');
      }
    });
  });
}

export function renderOrder(root, state, actions) {
  const total = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const canPayOrder = state.orderResult && !['PAID', 'PAID_MOCK', 'Paid_MOCK', 'PAID_DEMO'].includes(state.orderResult.status);
  root.innerHTML = `
    <section class="grid grid--2">
      <div class="card">
        <h2 class="section-title">Warenkorb</h2>
        ${state.cart.length === 0 ? '<p>Dein Warenkorb ist leer.</p>' : state.cart.map((item) => `
          <div class="cart-item">
            <div>
              <strong>${item.name}</strong><br />
              <small class="text-muted">${item.price.toFixed(2)} €</small>
            </div>
            <div class="cart-item__controls">
              <button class="btn btn--ghost" data-dec="${item.id}">-</button>
              <span>${item.quantity}</span>
              <button class="btn btn--ghost" data-inc="${item.id}">+</button>
              <button class="btn btn--ghost" data-remove="${item.id}">Entfernen</button>
            </div>
          </div>
        `).join('')}
        <div class="order-total"><strong>Gesamt: ${total.toFixed(2)} €</strong></div>
      </div>
      <div class="card order-summary">
        <h2 class="section-title">Checkout</h2>
        <form id="orderForm">
          <div class="form-group">
            <label for="orderName">Name</label>
            <input id="orderName" type="text" required />
            <small class="form-error" data-error="orderName"></small>
          </div>
          <div class="form-group">
            <label for="orderContact">Telefon oder E-Mail</label>
            <input id="orderContact" type="text" required />
            <small class="form-error" data-error="orderContact"></small>
          </div>
          <div class="form-group">
            <label for="orderReservation">Reservierungs-ID (optional)</label>
            <input id="orderReservation" type="number" min="1" />
          </div>
          <button class="btn" type="submit" ${state.cart.length === 0 ? 'disabled' : ''}>Bestellung abschicken</button>
        </form>
        <div id="orderResult">
          ${state.orderResult ? orderSummary(state.orderResult) : ''}
        </div>
      </div>
    </section>
  `;

  root.querySelectorAll('[data-inc]').forEach((button) => {
    button.addEventListener('click', () => actions.onUpdateQuantity(Number(button.dataset.inc), 1));
  });
  root.querySelectorAll('[data-dec]').forEach((button) => {
    button.addEventListener('click', () => actions.onUpdateQuantity(Number(button.dataset.dec), -1));
  });
  root.querySelectorAll('[data-remove]').forEach((button) => {
    button.addEventListener('click', () => actions.onRemoveFromCart(Number(button.dataset.remove)));
  });

  const form = root.querySelector('#orderForm');
  const submitButton = form.querySelector('button[type=\"submit\"]');
  const fields = Array.from(form.querySelectorAll('input[required]'));
  const updateErrors = () => {
    fields.forEach((field) => {
      const error = form.querySelector(`[data-error=\"${field.id}\"]`);
      if (!error) return;
      error.textContent = field.validity.valid ? '' : field.validationMessage;
    });
    submitButton.disabled = !form.checkValidity() || state.cart.length === 0;
  };
  fields.forEach((field) => field.addEventListener('input', updateErrors));
  updateErrors();
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const payload = {
      customerName: form.orderName.value.trim(),
      contact: form.orderContact.value.trim(),
      reservationId: form.orderReservation.value ? Number(form.orderReservation.value) : null,
      items: state.cart.map((item) => ({ menuItemId: item.id, quantity: item.quantity })),
    };
    actions.onCreateOrder(payload);
  });

  root.querySelectorAll('[data-qr]').forEach((button) => {
    button.addEventListener('click', () => actions.onShowOrderQr(Number(button.dataset.qr)));
  });
}

export function renderLookup(root, state, actions) {
  root.innerHTML = `
    <section class="card">
      <h2 class="section-title">Meine Reservierungen &amp; Bestellungen</h2>
      <form id="lookupForm" class="grid grid--2">
        <div class="form-group">
          <label for="lookupContact">Telefon oder E-Mail</label>
          <input id="lookupContact" type="text" required />
          <small class="form-error" data-error="lookupContact"></small>
        </div>
        <div class="form-group form-actions">
          <button class="btn" type="submit" disabled>Suchen</button>
        </div>
      </form>
    </section>
    <section class="grid grid--2" id="lookupResults">
      <div class="card">
        <h3 class="section-title">Reservierungen</h3>
        ${state.lookupReservations.length === 0 ? '<p>Keine Reservierungen gefunden.</p>' : state.lookupReservations.map(reservationSummary).join('')}
      </div>
      <div class="card">
        <h3 class="section-title">Bestellungen</h3>
        ${state.lookupOrders.length === 0 ? '<p>Keine Bestellungen gefunden.</p>' : state.lookupOrders.map((order) => orderSummary(order, true)).join('')}
      </div>
    </section>
  `;

  const form = root.querySelector('#lookupForm');
  const submitButton = form.querySelector('button[type=\"submit\"]');
  const contactInput = form.querySelector('#lookupContact');
  const updateErrors = () => {
    const error = form.querySelector('[data-error=\"lookupContact\"]');
    error.textContent = contactInput.validity.valid ? '' : contactInput.validationMessage;
    submitButton.disabled = !form.checkValidity();
  };
  contactInput.addEventListener('input', updateErrors);
  updateErrors();
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    actions.onLookup(form.lookupContact.value.trim());
  });

  root.querySelectorAll('[data-pay]').forEach((button) => {
    button.addEventListener('click', () => actions.onPayOrder(Number(button.dataset.pay)));
  });

  root.querySelectorAll('[data-qr]').forEach((button) => {
    button.addEventListener('click', () => actions.onShowOrderQr(Number(button.dataset.qr)));
  });
}

export function renderChef(root, state, actions) {
  const orders = Array.isArray(state.chefOrders) ? state.chefOrders : [];
  root.innerHTML = `
    <section class="card">
      <h2 class="section-title">Küche</h2>
      <p class="text-muted">Bezahlte Bestellungen in Reihenfolge der nächsten Reservierung (First come, first serve).</p>
    </section>
    <section id="chefOrders" class="grid grid--2">
      ${orders.length === 0 ? '<p class="text-muted">Keine bezahlten Bestellungen vorhanden.</p>' : orders.map((order) => chefOrderCard(order, state.completedOrders)).join('')}
    </section>
  `;

  root.querySelectorAll('[data-order-done]').forEach((button) => {
    button.addEventListener('click', () => actions.onMarkOrderDone(Number(button.dataset.orderDone)));
  });
}

export function renderWaiter(root, state, actions) {
  const orders = Array.isArray(state.waiterOrders) ? state.waiterOrders : [];
  const completedSet = new Set(state.completedOrders || []);
  const finishedOrders = orders.filter((order) => completedSet.has(order.id));
  const acceptedOrders = orders.filter((order) => !completedSet.has(order.id));
  const reservations = Array.isArray(state.waiterReservations) ? state.waiterReservations : [];

  root.innerHTML = `
    <section class="card">
      <h2 class="section-title">Service</h2>
      <p class="text-muted">Oben fertige Gerichte, darunter angenommene Bestellungen und alle Reservierungen.</p>
    </section>
    <section class="waiter-section">
      <h3 class="section-title">Fertige Gerichte</h3>
      <div class="grid grid--2">
        ${finishedOrders.length === 0 ? '<p class="text-muted">Keine fertigen Gerichte.</p>' : finishedOrders.map((order) => waiterOrderCard(order, true)).join('')}
      </div>
    </section>
    <section class="waiter-section">
      <h3 class="section-title">Angenommene Bestellungen</h3>
      <div class="grid grid--2">
        ${acceptedOrders.length === 0 ? '<p class="text-muted">Keine angenommenen Bestellungen.</p>' : acceptedOrders.map((order) => waiterOrderCard(order, false)).join('')}
      </div>
    </section>
    <section class="waiter-section">
      <h3 class="section-title">Reservierungen</h3>
      ${reservations.length === 0 ? '<p class="text-muted">Keine Reservierungen vorhanden.</p>' : reservations.map(waiterReservationRow).join('')}
    </section>
  `;
}
export function renderAdmin(root, state, actions) {
  const menuItems = Array.isArray(state.adminMenuItems) ? state.adminMenuItems : [];
  const orders = Array.isArray(state.adminOrders) ? state.adminOrders : [];
  const reservations = Array.isArray(state.adminReservations) ? state.adminReservations : [];

  root.innerHTML = `
    <section class="card">
      <h2 class="section-title">Admin</h2>
      <p class="text-muted">Alle Daten sehen, hinzufügen und löschen.</p>
      <div class="grid">
        <button class="btn btn--secondary" id="adminRefresh">Neu laden</button>
        <button class="btn btn--danger" id="adminDeleteAll">Alles löschen</button>
      </div>
    </section>

    <section class="card waiter-section">
      <h3 class="section-title">Menü</h3>
      <form id="adminMenuForm" class="grid grid--2">
        <div class="form-group">
          <label for="adminMenuName">Name</label>
          <input id="adminMenuName" type="text" required />
        </div>
        <div class="form-group">
          <label for="adminMenuCategory">Kategorie</label>
          <select id="adminMenuCategory" required>
            <option value="STARTER">Vorspeise</option>
            <option value="MAIN">Hauptgericht</option>
            <option value="DESSERT">Dessert</option>
            <option value="DRINK">Getränk</option>
          </select>
        </div>
        <div class="form-group">
          <label for="adminMenuPrice">Preis</label>
          <input id="adminMenuPrice" type="number" step="0.01" min="0" required />
        </div>
        <div class="form-group">
          <label for="adminMenuImage">Bild-URL</label>
          <input id="adminMenuImage" type="text" placeholder="/img/pizza.jpg" />
        </div>
        <div class="form-group" style="grid-column: 1 / -1;">
          <label for="adminMenuDescription">Beschreibung</label>
          <textarea id="adminMenuDescription" rows="2" required></textarea>
        </div>
        <div class="form-group">
          <label>
            <input id="adminMenuAvailable" type="checkbox" checked />
            Verfügbar
          </label>
        </div>
        <div class="form-group form-actions">
          <button class="btn" type="submit">Menüeintrag hinzufügen</button>
          <button class="btn btn--danger" type="button" id="adminDeleteAllMenu">Alle Menüeinträge löschen</button>
        </div>
      </form>
      <div>
        ${menuItems.length === 0 ? '<p class="text-muted">Keine Menüeinträge.</p>' : menuItems.map(adminMenuRow).join('')}
      </div>
    </section>

    <section class="card waiter-section">
      <h3 class="section-title">Bestellungen</h3>
      <div class="grid">
        <button class="btn btn--danger" id="adminDeleteAllOrders">Alle Bestellungen löschen</button>
      </div>
      <div>
        ${orders.length === 0 ? '<p class="text-muted">Keine Bestellungen.</p>' : orders.map(adminOrderRow).join('')}
      </div>
    </section>

    <section class="card waiter-section">
      <h3 class="section-title">Reservierungen</h3>
      <div class="grid">
        <button class="btn btn--danger" id="adminDeleteAllReservations">Alle Reservierungen löschen</button>
      </div>
      <div>
        ${reservations.length === 0 ? '<p class="text-muted">Keine Reservierungen.</p>' : reservations.map(adminReservationRow).join('')}
      </div>
    </section>
  `;

  root.querySelector('#adminRefresh')?.addEventListener('click', actions.onAdminRefresh);
  root.querySelector('#adminDeleteAll')?.addEventListener('click', () => {
    if (confirm('Wirklich ALLES löschen?')) {
      actions.onAdminDeleteEverything();
    }
  });
  root.querySelector('#adminDeleteAllMenu')?.addEventListener('click', () => {
    if (confirm('Alle Menüeinträge löschen?')) {
      actions.onAdminDeleteAllMenuItems();
    }
  });
  root.querySelector('#adminDeleteAllOrders')?.addEventListener('click', () => {
    if (confirm('Alle Bestellungen löschen?')) {
      actions.onAdminDeleteAllOrders();
    }
  });
  root.querySelector('#adminDeleteAllReservations')?.addEventListener('click', () => {
    if (confirm('Alle Reservierungen löschen?')) {
      actions.onAdminDeleteAllReservations();
    }
  });

  const form = root.querySelector('#adminMenuForm');
  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const payload = {
      name: form.adminMenuName.value.trim(),
      description: form.adminMenuDescription.value.trim(),
      price: Number(form.adminMenuPrice.value),
      category: form.adminMenuCategory.value,
      imageUrl: form.adminMenuImage.value.trim(),
      available: form.adminMenuAvailable.checked,
    };
    actions.onAdminCreateMenuItem(payload);
    form.reset();
    form.adminMenuAvailable.checked = true;
  });

  root.querySelectorAll('[data-admin-delete-menu]').forEach((button) => {
    button.addEventListener('click', () => actions.onAdminDeleteMenuItem(Number(button.dataset.adminDeleteMenu)));
  });
  root.querySelectorAll('[data-admin-delete-order]').forEach((button) => {
    button.addEventListener('click', () => actions.onAdminDeleteOrder(Number(button.dataset.adminDeleteOrder)));
  });
  root.querySelectorAll('[data-admin-delete-reservation]').forEach((button) => {
    button.addEventListener('click', () => actions.onAdminDeleteReservation(Number(button.dataset.adminDeleteReservation)));
  });
}
export function renderContact(root) {
  root.innerHTML = `
    <section class="card">
      <h2 class="section-title">Kontakt</h2>
      <p>Rufe uns an oder schreibe uns eine Nachricht – wir freuen uns auf dich!</p>
      <p><strong>Telefon:</strong> +49 30 1234567</p>
      <p><strong>E-Mail:</strong> hallo@restaurantapp.de</p>
      <p><strong>Adresse:</strong> Musterstraße 10, 10115 Berlin</p>
      <p>Öffnungszeiten: Mo-So 12:00–22:30 Uhr</p>
    </section>
  `;
}

function reservationSummary(reservation) {
  return `
    <div class="summary-item">
      <strong>#${reservation.id}</strong> – ${reservation.customerName}<br />
      <small>${formatDateTime(reservation.dateTimeStart)} | ${reservation.persons} Personen | ${reservation.durationMinutes} Min</small><br />
      <small>Tisch: ${reservation.tableName} | Status: ${reservation.status}</small>
    </div>
  `;
}

function reservationGallery() {
  return `
    <div class="reservation-media">
      <div class="reservation-media__item">
        <img src="/img/PizzaMargarita.jpg" alt="Pizza Margherita" loading="lazy" data-fallback />
        <div class="menu-card__fallback hidden">Bild nicht verfügbar</div>
        <p class="reservation-media__caption">Italienische Klassiker</p>
      </div>
      <div class="reservation-media__item">
        <img src="/img/Tiramisu.jpg" alt="Tiramisu" loading="lazy" data-fallback />
        <div class="menu-card__fallback hidden">Bild nicht verfügbar</div>
        <p class="reservation-media__caption">Hausgemachte Desserts</p>
      </div>
    </div>
  `;
}

function orderSummary(order, includePay = false) {
  return `
    <div class="summary-item">
      <strong>#${order.id}</strong> - ${order.customerName}<br />
      <small>Status: ${order.status} | Gesamt: ${order.total.toFixed(2)} EUR</small><br />
      <small>${order.items.map((item) => `${item.quantity}x ${item.nameSnapshot}`).join(', ')}</small>
      <div style="margin-top:8px; display:flex; gap:8px; flex-wrap:wrap;">
        <button class="btn btn--secondary" data-qr="${order.id}">QR anzeigen</button>
        ${includePay && !['PAID', 'PAID_MOCK', 'Paid_MOCK', 'PAID_DEMO'].includes(order.status) ? `<button class="btn" data-pay="${order.id}">Jetzt bezahlen</button>` : ''}
      </div>
    </div>
  `;
}

function chefOrderCard(order, completedOrders = []) {
  const total = Number(order.total || 0);
  const reservationTime = order.reservation?.dateTimeStart
    ? formatDateTime(order.reservation.dateTimeStart)
    : 'Keine Reservierung';
  const tableInfo = order.reservation?.tableName ? `Tisch: ${order.reservation.tableName}` : '';
  const createdAt = order.createdAt ? formatDateTime(order.createdAt) : '';
  const items = Array.isArray(order.items)
    ? order.items.map((item) => `${item.quantity}x ${item.nameSnapshot}`).join(', ')
    : '';
  const isDone = completedOrders.includes(order.id);
  return `
    <article class="card">
      <div class="chef-order__header">
        <h3 class="section-title">Bestellung #${order.id}</h3>
        <span class="badge price-badge">${total.toFixed(2)} €</span>
      </div>
      <div class="chef-order__meta">
        <div>Reservierung: ${reservationTime}</div>
        ${tableInfo ? `<div>${tableInfo}</div>` : ''}
        ${createdAt ? `<div>Eingang: ${createdAt}</div>` : ''}
      </div>
      <p>${items || 'Keine Items vorhanden.'}</p>
      <button class="btn btn--big ${isDone ? 'btn--success' : ''}" data-order-done="${order.id}" ${isDone ? 'disabled' : ''}>
        ${isDone ? 'FERTIG GEKOCHT' : 'Als fertig gekocht markieren'}
      </button>
    </article>
  `;
}

function formatDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('de-DE');
}

function waiterOrderCard(order, isDone) {
  const total = Number(order.total || 0);
  const reservationTime = order.reservation?.dateTimeStart
    ? formatDateTime(order.reservation.dateTimeStart)
    : 'Keine Reservierung';
  const tableInfo = order.reservation?.tableName ? `Tisch: ${order.reservation.tableName}` : '';
  const items = Array.isArray(order.items)
    ? order.items.map((item) => `${item.quantity}x ${item.nameSnapshot}`).join(', ')
    : '';
  return `
    <article class="card">
      <div class="chef-order__header">
        <h3 class="section-title">Bestellung #${order.id}</h3>
        <span class="badge price-badge">${total.toFixed(2)} </span>
      </div>
      <div class="chef-order__meta">
        <div>Reservierung: ${reservationTime}</div>
        ${tableInfo ? `<div>${tableInfo}</div>` : ''}
      </div>
      <p>${items || 'Keine Items vorhanden.'}</p>
      <span class="badge ${isDone ? 'price-badge' : ''}">${isDone ? 'Fertig gekocht' : 'Angenommen'}</span>
    </article>
  `;
}

function waiterReservationRow(reservation) {
  return `
    <div class="summary-item">
      <strong>#${reservation.id}</strong>  ${reservation.customerName}<br />
      <small>${formatDateTime(reservation.dateTimeStart)} | ${reservation.persons} Personen | ${reservation.durationMinutes} Min</small><br />
      <small>Tisch: ${reservation.tableName} | Status: ${reservation.status}</small>
    </div>
  `;
}

function adminMenuRow(item) {
  return `
    <div class="summary-item">
      <strong>#${item.id}</strong>  ${item.name} (${item.category})<br />
      <small>${item.description}</small><br />
      <small>Preis: ${Number(item.price || 0).toFixed(2)}  | Bild: ${item.imageUrl || '-'}</small>
      <div style="margin-top:8px;">
        <button class="btn btn--danger" data-admin-delete-menu="${item.id}">Löschen</button>
      </div>
    </div>
  `;
}

function adminOrderRow(order) {
  const items = Array.isArray(order.items)
    ? order.items.map((item) => `${item.quantity}x ${item.nameSnapshot}`).join(', ')
    : '';
  return `
    <div class="summary-item">
      <strong>#${order.id}</strong>  ${order.customerName}<br />
      <small>Status: ${order.status} | Gesamt: ${Number(order.total || 0).toFixed(2)} </small><br />
      <small>${items || 'Keine Items.'}</small>
      <div style="margin-top:8px;">
        <button class="btn btn--danger" data-admin-delete-order="${order.id}">Löschen</button>
      </div>
    </div>
  `;
}

function adminReservationRow(reservation) {
  return `
    <div class="summary-item">
      <strong>#${reservation.id}</strong>  ${reservation.customerName}<br />
      <small>${formatDateTime(reservation.dateTimeStart)} | ${reservation.persons} Personen | ${reservation.durationMinutes} Min</small><br />
      <small>Tisch: ${reservation.tableName} | Status: ${reservation.status}</small>
      <div style="margin-top:8px;">
        <button class="btn btn--danger" data-admin-delete-reservation="${reservation.id}">Löschen</button>
      </div>
    </div>
  `;
}
