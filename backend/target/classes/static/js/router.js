const routes = new Map();

export function registerRoute(path, renderer) {
  routes.set(path, renderer);
}

export function initRouter() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}

export function navigate(path) {
  window.location.hash = path;
}

export function handleRoute() {
  const hash = window.location.hash || '#/home';
  const path = hash.replace('#', '');
  document.querySelectorAll('.site-nav a').forEach((link) => {
    link.classList.toggle('active', link.getAttribute('href') === hash);
  });

  const renderer = routes.get(path) || routes.get('/home');
  if (renderer) {
    renderer();
  }
}
