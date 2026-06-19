(function () {
  const nav = document.querySelector('.site-nav');
  const menu = document.querySelector('.menu-toggle');

  if (menu && nav) {
    menu.addEventListener('click', function () {
      const opened = nav.classList.toggle('open');
      menu.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  const topButton = document.querySelector('.back-top');

  if (topButton) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 480) {
        topButton.classList.add('show');
      } else {
        topButton.classList.remove('show');
      }
    }, { passive: true });

    topButton.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dot'));
  let current = 0;
  let timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === current);
    });

    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === current);
    });
  }

  function startSlides() {
    if (timer) {
      window.clearInterval(timer);
    }

    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5600);
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.dataset.target || 0));
      startSlides();
    });
  });

  if (slides.length) {
    startSlides();
  }

  const searchInputs = Array.from(document.querySelectorAll('.movie-search'));
  const typeFilters = Array.from(document.querySelectorAll('.type-filter'));
  const yearFilters = Array.from(document.querySelectorAll('.year-filter'));

  function activeValue(list, fallback) {
    const item = list.find(function (el) {
      return el && el.value;
    });
    return item ? item.value : fallback;
  }

  function applyFilters(scope) {
    const root = scope || document;
    const queryInput = root.querySelector('.movie-search');
    const typeFilter = root.querySelector('.type-filter');
    const yearFilter = root.querySelector('.year-filter');
    const query = queryInput ? queryInput.value.trim().toLowerCase() : '';
    const typeValue = typeFilter ? typeFilter.value : activeValue(typeFilters, 'all');
    const yearValue = yearFilter ? yearFilter.value : activeValue(yearFilters, 'all');
    const cards = Array.from(root.querySelectorAll('.movie-card'));

    cards.forEach(function (card) {
      const text = (card.dataset.search || '').toLowerCase();
      const type = card.dataset.type || '';
      const year = Number(card.dataset.year || 0);
      const matchQuery = !query || text.indexOf(query) !== -1;
      const matchType = typeValue === 'all' || type.indexOf(typeValue) !== -1;
      let matchYear = true;

      if (yearValue === 'older') {
        matchYear = year > 0 && year < 2023;
      } else if (yearValue !== 'all') {
        matchYear = String(year) === yearValue;
      }

      card.classList.toggle('is-hidden', !(matchQuery && matchType && matchYear));
    });
  }

  searchInputs.concat(typeFilters).concat(yearFilters).forEach(function (control) {
    control.addEventListener('input', function () {
      const section = control.closest('.page-section') || document;
      applyFilters(section);
    });

    control.addEventListener('change', function () {
      const section = control.closest('.page-section') || document;
      applyFilters(section);
    });
  });
}());
