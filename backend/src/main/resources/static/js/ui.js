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
}

export function renderOrder(root, state, actions) {
  const total = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
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
          ${state.orderResult ? orderSummary(state.orderResult, true) : ''}
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
  root.querySelectorAll('[data-pay]').forEach((button) => {
    button.addEventListener('click', () => actions.onStartPayment(Number(button.dataset.pay)));
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
    button.addEventListener('click', () => actions.onStartPayment(Number(button.dataset.pay)));
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

function orderSummary(order, includePay = false) {
  const isMockPaid = order.status === 'PAID_MOCK' || order.status === 'Paid_MOCK';
  const statusLabel = isMockPaid ? 'PAID (Mock)' : order.status;
  const canPay = order.status !== 'PAID' && !isMockPaid;
  return `
    <div class="summary-item">
      <strong>#${order.id}</strong> – ${order.customerName}<br />
      <small>Status: ${statusLabel} | Gesamt: ${order.total.toFixed(2)} €</small><br />
      <small>${order.items.map((item) => `${item.quantity}x ${item.nameSnapshot}`).join(', ')}</small>
      ${includePay && canPay ? `<div><button class="btn" data-pay="${order.id}">Online bezahlen</button></div>` : ''}
    </div>
  `;
}

function formatDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('de-DE');
}
