(() => {
  'use strict';
  const nav = document.querySelector('#main-nav');
  const menu = document.querySelector('.menu-toggle');
  if (nav && menu) {
    const closeMenu = (returnFocus = false) => {
      nav.classList.remove('is-open');
      menu.setAttribute('aria-expanded', 'false');
      if (returnFocus) menu.focus();
    };
    menu.addEventListener('click', () => {
      const expanded = menu.getAttribute('aria-expanded') !== 'true';
      menu.setAttribute('aria-expanded', String(expanded));
      nav.classList.toggle('is-open', expanded);
    });
    nav.addEventListener('click', (event) => {
      if (event.target.closest('a')) closeMenu();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') closeMenu(true);
    });
    menu.hidden = false;
    document.documentElement.classList.add('js-nav');
  }

  const cards = [...document.querySelectorAll('.archive-project')];
  const filters = [...document.querySelectorAll('[data-filter]')];
  const toolbar = document.querySelector('.project-toolbar');
  const status = document.querySelector('.filter-status');
  const numbers = new Intl.NumberFormat('fa-IR');
  const matches = (card, filter) => filter === 'all' || card.dataset.category.split(' ').includes(filter);
  const showCategory = (filter) => {
    let visible = 0;
    cards.forEach((card) => {
      const show = matches(card, filter);
      card.hidden = !show;
      if (show) visible += 1;
    });
    filters.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.filter === filter)));
    if (status) status.textContent = numbers.format(visible) + ' پروژه از ' + numbers.format(cards.length) + ' پروژه';
  };
  filters.forEach((button) => {
    const count = cards.filter((card) => matches(card, button.dataset.filter)).length;
    const badge = button.querySelector('span') || document.createElement('span');
    badge.textContent = numbers.format(count);
    if (!badge.parentNode) button.append(' ', badge);
    button.addEventListener('click', () => showCategory(button.dataset.filter));
  });
  if (toolbar && cards.length) {
    showCategory('all');
    toolbar.hidden = false;
  }

  const revealProject = (hash) => {
    if (!hash || !hash.startsWith('#project-')) return;
    const card = document.getElementById(hash.slice(1));
    if (!card || !card.matches('.archive-project')) return;
    if (card.hidden) showCategory('all');
    const details = card.querySelector('details');
    if (details) details.open = true;
  };
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#project-"]');
    if (link) revealProject(link.getAttribute('href'));
  });
  window.addEventListener('hashchange', () => revealProject(window.location.hash));
  revealProject(window.location.hash);

  let printStates = null;
  const preparePrint = () => {
    if (printStates) return;
    printStates = [...document.querySelectorAll('details')].map((element) => ({ element, open: element.open }));
    printStates.forEach(({ element }) => { element.open = true; });
  };
  const restoreAfterPrint = () => {
    if (!printStates) return;
    printStates.forEach(({ element, open }) => { element.open = open; });
    printStates = null;
  };
  window.addEventListener('beforeprint', preparePrint);
  window.addEventListener('afterprint', restoreAfterPrint);
  document.querySelectorAll('.print-button').forEach((button) => {
    button.addEventListener('click', () => window.print());
    button.hidden = false;
  });
})();
