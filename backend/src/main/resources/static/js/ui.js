export function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.classList.remove('show'), 3000);
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

export function renderMenu(root, state, actions) {
  const categories = ['Alle', ...new Set(state.menuItems.map((item) => item.category))];
  root.innerHTML = `
    <section class="card">
      <h2 class="section-title">Speisekarte</h2>
      <div class="grid grid--2">
        <div class="form-group">
          <label for="category">Kategorie</label>
          <select id="category">
            ${categories.map((cat) => `<option value="${cat}">${cat}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label for="search">Suche</label>
          <input id="search" type="text" placeholder="z.B. Pizza" />
        </div>
      </div>
    </section>
    <section class="grid grid--3" id="menuGrid"></section>
  `;

  const menuGrid = root.querySelector('#menuGrid');
  const categorySelect = root.querySelector('#category');
  const searchInput = root.querySelector('#search');

  function renderList() {
    const filterCategory = categorySelect.value;
    const query = searchInput.value.toLowerCase();
    const filtered = state.menuItems.filter((item) => {
      const matchesCategory = filterCategory === 'Alle' || item.category === filterCategory;
      const matchesSearch = item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });

    menuGrid.innerHTML = filtered.map((item) => `
      <article class="card menu-card">
        ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.name}" />` : ''}
        <span class="badge">${item.category}</span>
        <h3>${item.name}</h3>
        <p>${item.description}</p>
        <strong>${item.price.toFixed(2)} €</strong>
        <div class="grid">
          <button class="btn" data-add="${item.id}">In den Warenkorb</button>
          <button class="btn btn--ghost" data-detail="${item.id}">Details</button>
        </div>
      </article>
    `).join('');

    menuGrid.querySelectorAll('[data-add]').forEach((button) => {
      button.addEventListener('click', () => actions.onAddToCart(Number(button.dataset.add)));
    });

    menuGrid.querySelectorAll('[data-detail]').forEach((button) => {
      button.addEventListener('click', () => actions.onShowDetail(Number(button.dataset.detail)));
    });
  }

  categorySelect.addEventListener('change', renderList);
  searchInput.addEventListener('input', renderList);
  renderList();
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
          </div>
          <div class="form-group">
            <label for="resContact">Telefon oder E-Mail</label>
            <input id="resContact" type="text" required />
          </div>
          <div class="form-group">
            <label for="resDateTime">Datum &amp; Startzeit</label>
            <input id="resDateTime" type="datetime-local" required />
          </div>
          <div class="form-group">
            <label for="resDuration">Dauer (Minuten)</label>
            <input id="resDuration" type="number" value="90" min="30" step="15" required />
          </div>
          <div class="form-group">
            <label for="resPersons">Personen</label>
            <input id="resPersons" type="number" value="2" min="1" required />
          </div>
          <button class="btn" type="submit">Reservierung anfragen</button>
        </form>
      </div>
      <div class="card" id="reservationResult">
        <h3 class="section-title">Bestätigung</h3>
        ${state.reservationResult ? reservationSummary(state.reservationResult) : '<p>Noch keine Reservierung erstellt.</p>'}
      </div>
    </section>
  `;

  const form = root.querySelector('#reservationForm');
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
              <small>${item.price.toFixed(2)} €</small>
            </div>
            <div class="grid" style="grid-auto-flow: column; align-items: center; gap: 6px;">
              <button class="btn btn--ghost" data-dec="${item.id}">-</button>
              <span>${item.quantity}</span>
              <button class="btn btn--ghost" data-inc="${item.id}">+</button>
              <button class="btn btn--ghost" data-remove="${item.id}">Entfernen</button>
            </div>
          </div>
        `).join('')}
        <div style="margin-top: 12px;"><strong>Gesamt: ${total.toFixed(2)} €</strong></div>
      </div>
      <div class="card">
        <h2 class="section-title">Checkout</h2>
        <form id="orderForm">
          <div class="form-group">
            <label for="orderName">Name</label>
            <input id="orderName" type="text" required />
          </div>
          <div class="form-group">
            <label for="orderContact">Telefon oder E-Mail</label>
            <input id="orderContact" type="text" required />
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
        </div>
        <div class="form-group" style="align-self: end;">
          <button class="btn" type="submit">Suchen</button>
        </div>
      </form>
    </section>
    <section class="grid grid--2" style="margin-top: 16px;">
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
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    actions.onLookup(form.lookupContact.value.trim());
  });

  root.querySelectorAll('[data-pay]').forEach((button) => {
    button.addEventListener('click', () => actions.onPayOrder(Number(button.dataset.pay)));
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
    <div style="margin-bottom: 12px;">
      <strong>#${reservation.id}</strong> – ${reservation.customerName}<br />
      <small>${formatDateTime(reservation.dateTimeStart)} | ${reservation.persons} Personen | ${reservation.durationMinutes} Min</small><br />
      <small>Tisch: ${reservation.tableName} | Status: ${reservation.status}</small>
    </div>
  `;
}

function orderSummary(order, includePay = false) {
  return `
    <div style="margin-bottom: 12px;">
      <strong>#${order.id}</strong> – ${order.customerName}<br />
      <small>Status: ${order.status} | Gesamt: ${order.total.toFixed(2)} €</small><br />
      <small>${order.items.map((item) => `${item.quantity}x ${item.nameSnapshot}`).join(', ')}</small>
      ${includePay && order.status !== 'PAID' ? `<div><button class="btn" data-pay="${order.id}">Jetzt bezahlen</button></div>` : ''}
    </div>
  `;
}

function formatDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('de-DE');
}
