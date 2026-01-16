import { api } from './api.js';
import { showToast, setLoading } from './ui.js';

const categoryOrder = ['STARTER', 'MAIN', 'DESSERT', 'DRINK'];
const categoryTitles = {
  STARTER: 'Vorspeisen',
  MAIN: 'Hauptgerichte',
  DESSERT: 'Desserts',
  DRINK: 'Getränke',
};

function renderCategorySection(category, items) {
  const title = categoryTitles[category] || category;
  return `
    <section class="menu-section">
      <h3 class="section-title">${title}</h3>
      <div class="grid grid--3">
        ${items.map((item) => `
          <article class="card menu-card">
            <div class="menu-card__media">
              <img src="${item.imageUrl}" alt="${item.name}" loading="lazy" />
            </div>
            <div class="menu-card__meta">
              <span class="badge">${title}</span>
              <span class="badge price-badge">${item.price.toFixed(2)} €</span>
            </div>
            <h4>${item.name}</h4>
            <button class="btn" data-add="${item.id}">In den Warenkorb</button>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

export async function renderMenu(root, state, actions) {
  const template = document.getElementById('menuSectionTemplate');
  root.innerHTML = template ? template.innerHTML : `
    <section class="card">
      <h2 class="section-title">Speisekarte</h2>
      <p class="text-muted">Unsere österreichischen Klassiker frisch zubereitet.</p>
    </section>
    <section id="menuContent"></section>
  `;

  const container = root.querySelector('#menuContent');
  setLoading(true);
  try {
    state.menuItems = await api.getMenu();
    const grouped = categoryOrder.map((category) => ({
      category,
      items: state.menuItems.filter((item) => item.category === category),
    })).filter((group) => group.items.length > 0);

    container.innerHTML = grouped.map((group) => renderCategorySection(group.category, group.items)).join('');
    container.querySelectorAll('[data-add]').forEach((button) => {
      button.addEventListener('click', () => actions.onAddToCart(Number(button.dataset.add)));
    });
  } catch (error) {
    showToast('Menü konnte nicht geladen werden.', 'error');
    container.innerHTML = '<p class="text-muted">Menüdaten sind aktuell nicht verfügbar.</p>';
  } finally {
    setLoading(false);
  }
}
