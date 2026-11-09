import './estimate.js';
import './design.js';
import './blueprint.js';
const pages = {home: 'homeScreen', plans: 'plansPage', estimate: 'estimatePage', design: 'designPage'};
export function openPage(page) {
  if (!(page in pages)) page = 'home';
  for (const [name, id] of Object.entries(pages)) document.getElementById(id).hidden = name !== page;
  document.querySelectorAll('[data-page]').forEach(button => {
    const active = button.dataset.page === page;
    button.classList.toggle('active', active);
    if (active) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current');
  });
  history.replaceState(null, '', `#${page}`);
  window.scrollTo({top: 0});
}
document.querySelectorAll('[data-page],[data-open]').forEach(button => button.addEventListener('click', () => openPage(button.dataset.page || button.dataset.open)));
window.addEventListener('hashchange', () => openPage(location.hash.slice(1)));
window.addEventListener('open-workspace', event => openPage(event.detail));
openPage(location.hash.slice(1));
