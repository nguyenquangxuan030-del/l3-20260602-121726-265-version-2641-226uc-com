document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var pageMain = scope.closest('main') || document;
    var list = pageMain.querySelector('[data-card-list]');
    var empty = pageMain.querySelector('[data-empty-state]');
    var textInput = scope.querySelector('[data-filter-text]');
    var yearInput = scope.querySelector('[data-filter-year]');
    var regionInput = scope.querySelector('[data-filter-region]');
    var typeInput = scope.querySelector('[data-filter-type]');

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
      if (!list) {
        return;
      }

      var text = normalize(textInput && textInput.value);
      var year = normalize(yearInput && yearInput.value);
      var region = normalize(regionInput && regionInput.value);
      var type = normalize(typeInput && typeInput.value);
      var visible = 0;

      Array.from(list.querySelectorAll('[data-movie-card]')).forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.year,
          card.dataset.region,
          card.dataset.type,
          card.dataset.genre
        ].join(' '));
        var ok = true;

        if (text && haystack.indexOf(text) === -1) {
          ok = false;
        }
        if (year && normalize(card.dataset.year) !== year) {
          ok = false;
        }
        if (region && normalize(card.dataset.region) !== region) {
          ok = false;
        }
        if (type && normalize(card.dataset.type) !== type) {
          ok = false;
        }

        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [textInput, yearInput, regionInput, typeInput].forEach(function (input) {
      if (input) {
        input.addEventListener('input', applyFilters);
        input.addEventListener('change', applyFilters);
      }
    });
  });
});
