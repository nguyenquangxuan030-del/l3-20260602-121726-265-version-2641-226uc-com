(function () {
  var form = document.querySelector('[data-search-form]');
  var input = document.querySelector('[data-search-input]');
  var results = document.querySelector('[data-search-results]');
  var movies = window.MOVIE_SEARCH_DATA || [];
  var params = new URLSearchParams(window.location.search);

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function render(query) {
    if (!results) {
      return;
    }

    var q = normalize(query);
    var matched = movies.filter(function (movie) {
      if (!q) {
        return true;
      }

      return normalize([
        movie.title,
        movie.year,
        movie.region,
        movie.type,
        movie.genre,
        movie.tags,
        movie.category
      ].join(' ')).indexOf(q) !== -1;
    }).slice(0, 120);

    if (!matched.length) {
      results.innerHTML = '<p class="empty-state">没有找到匹配的影片。</p>';
      return;
    }

    results.innerHTML = [
      '<p class="search-count">搜索结果</p>',
      '<div class="search-result-list">',
      matched.map(function (movie) {
        return [
          '<a class="search-result-item" href="', escapeHtml(movie.url), '">',
          '<img src="', escapeHtml(movie.cover), '" alt="', escapeHtml(movie.title), '" loading="lazy" onerror="this.style.display=\'none\';">',
          '<span>',
          '<h2>', escapeHtml(movie.title), '</h2>',
          '<p>', escapeHtml(movie.year), ' · ', escapeHtml(movie.region), ' · ', escapeHtml(movie.type), ' · ', escapeHtml(movie.genre), '</p>',
          '<p>', escapeHtml(movie.oneLine), '</p>',
          '</span>',
          '</a>'
        ].join('');
      }).join(''),
      '</div>'
    ].join('');
  }

  if (input) {
    input.value = params.get('q') || '';
  }

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      render(input && input.value);
      var url = new URL(window.location.href);
      url.searchParams.set('q', input && input.value ? input.value : '');
      window.history.replaceState(null, '', url.toString());
    });
  }

  if (input) {
    input.addEventListener('input', function () {
      render(input.value);
    });
  }

  render(input && input.value);
})();
