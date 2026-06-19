(function () {
  'use strict';

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initImageFallbacks() {
    document.querySelectorAll('img[data-fallback-title]').forEach(function (image) {
      image.addEventListener('error', function () {
        var shell = image.closest('.poster-shell');
        if (shell) {
          shell.classList.add('image-fallback');
        }
        image.style.opacity = '0';
      });
    });
  }

  function initMobileMenu() {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      var isOpen = panel.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  function initSearchForms() {
    document.querySelectorAll('form[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || input.value.trim()) {
          return;
        }
        event.preventDefault();
        input.focus();
      });
    });
  }

  function initHeroSlider() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function activate(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
        slide.setAttribute('aria-hidden', String(slideIndex !== current));
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
        dot.setAttribute('aria-current', dotIndex === current ? 'true' : 'false');
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        activate(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        activate(index);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        activate(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        activate(current + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    activate(0);
    start();
  }

  function getNumericValue(card, key) {
    var value = Number(card.getAttribute('data-' + key));
    return Number.isFinite(value) ? value : 0;
  }

  function initFilterableGrids() {
    document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
      var targetId = panel.getAttribute('data-filter-panel');
      var grid = document.getElementById(targetId);
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));
      var countNode = document.querySelector('[data-result-count="' + targetId + '"]');
      var searchInput = panel.querySelector('[data-filter-search]');
      var sortSelect = panel.querySelector('[data-filter-sort]');
      var yearSelect = panel.querySelector('[data-filter-year]');
      var typeSelect = panel.querySelector('[data-filter-type]');

      function apply() {
        var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        var year = yearSelect ? yearSelect.value : '';
        var type = typeSelect ? typeSelect.value : '';
        var visibleCards = [];

        cards.forEach(function (card) {
          var text = (card.getAttribute('data-search') || '').toLowerCase();
          var cardYear = card.getAttribute('data-year') || '';
          var cardType = card.getAttribute('data-type') || '';
          var visible = true;

          if (query && text.indexOf(query) === -1) {
            visible = false;
          }
          if (year && cardYear !== year) {
            visible = false;
          }
          if (type && cardType !== type) {
            visible = false;
          }

          card.style.display = visible ? '' : 'none';
          if (visible) {
            visibleCards.push(card);
          }
        });

        var sort = sortSelect ? sortSelect.value : 'default';
        visibleCards.sort(function (a, b) {
          if (sort === 'views') {
            return getNumericValue(b, 'views') - getNumericValue(a, 'views');
          }
          if (sort === 'rating') {
            return getNumericValue(b, 'rating') - getNumericValue(a, 'rating');
          }
          if (sort === 'year') {
            return getNumericValue(b, 'year-number') - getNumericValue(a, 'year-number');
          }
          if (sort === 'title') {
            return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
          }
          return getNumericValue(a, 'index') - getNumericValue(b, 'index');
        });

        visibleCards.forEach(function (card) {
          grid.appendChild(card);
        });

        if (countNode) {
          countNode.textContent = String(visibleCards.length);
        }
      }

      [searchInput, sortSelect, yearSelect, typeSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  function initPlayers() {
    document.querySelectorAll('[data-player]').forEach(function (player) {
      var video = player.querySelector('video[data-hls-src]');
      var playButton = player.querySelector('[data-player-play]');
      var status = player.querySelector('[data-player-status]');
      if (!video) {
        return;
      }
      var source = video.getAttribute('data-hls-src');
      var hlsInstance = null;

      function setStatus(message) {
        if (status) {
          status.textContent = message;
        }
      }

      if (source) {
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus('播放源已就绪，点击画面开始播放');
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              setStatus('网络波动，正在重新连接播放源');
              hlsInstance.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              setStatus('媒体解码异常，正在尝试恢复');
              hlsInstance.recoverMediaError();
            } else {
              setStatus('播放源暂时无法加载，请稍后重试');
              hlsInstance.destroy();
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          setStatus('播放源已就绪，点击画面开始播放');
        } else {
          video.src = source;
          setStatus('浏览器不支持 HLS 扩展时会尝试使用原生播放');
        }
      }

      function togglePlay() {
        if (video.paused) {
          var playPromise = video.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
              setStatus('浏览器阻止了自动播放，请再次点击播放按钮');
            });
          }
        } else {
          video.pause();
        }
      }

      if (playButton) {
        playButton.addEventListener('click', togglePlay);
      }
      video.addEventListener('click', togglePlay);
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
        setStatus('正在播放');
      });
      video.addEventListener('pause', function () {
        player.classList.remove('is-playing');
        setStatus('已暂停，点击继续播放');
      });
      video.addEventListener('ended', function () {
        player.classList.remove('is-playing');
        setStatus('播放结束');
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  function createSearchCard(movie) {
    var card = document.createElement('a');
    card.className = 'movie-card';
    card.href = movie.url;

    var cover = document.createElement('div');
    cover.className = 'movie-cover poster-shell';
    cover.setAttribute('data-fallback-title', movie.title);

    var image = document.createElement('img');
    image.src = movie.image;
    image.alt = movie.title;
    image.loading = 'lazy';
    image.setAttribute('data-fallback-title', movie.title);

    var duration = document.createElement('span');
    duration.className = 'duration-badge';
    duration.textContent = movie.duration;

    var play = document.createElement('span');
    play.className = 'play-float';
    play.textContent = '▶';

    var body = document.createElement('div');
    body.className = 'movie-body';

    var title = document.createElement('h3');
    title.className = 'movie-title line-clamp-2';
    title.textContent = movie.title;

    var desc = document.createElement('p');
    desc.className = 'movie-desc line-clamp-2';
    desc.textContent = movie.oneLine || movie.summary || '';

    var meta = document.createElement('div');
    meta.className = 'movie-meta';
    meta.innerHTML = '<span>⭐ ' + movie.rating + '</span><span>👁 ' + Number(movie.views).toLocaleString() + '</span><span>' + movie.year + '</span>';

    cover.appendChild(image);
    cover.appendChild(duration);
    cover.appendChild(play);
    body.appendChild(title);
    body.appendChild(desc);
    body.appendChild(meta);
    card.appendChild(cover);
    card.appendChild(body);
    return card;
  }

  function initSearchPage() {
    var results = document.querySelector('[data-search-results]');
    if (!results || !window.SEARCH_MOVIES) {
      return;
    }
    var form = document.querySelector('[data-large-search-form]');
    var input = document.querySelector('[data-large-search-input]');
    var countNode = document.querySelector('[data-search-count]');
    var emptyState = document.querySelector('[data-search-empty]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    function render(query) {
      var normalized = query.trim().toLowerCase();
      var matches = window.SEARCH_MOVIES.filter(function (movie) {
        if (!normalized) {
          return true;
        }
        return movie.searchText.toLowerCase().indexOf(normalized) !== -1;
      }).slice(0, 160);

      results.innerHTML = '';
      matches.forEach(function (movie) {
        results.appendChild(createSearchCard(movie));
      });
      initImageFallbacks();

      if (countNode) {
        countNode.textContent = String(matches.length);
      }
      if (emptyState) {
        emptyState.classList.toggle('is-visible', matches.length === 0);
      }
    }

    if (input) {
      input.value = initialQuery;
    }
    render(initialQuery);

    if (form && input) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var query = input.value.trim();
        var nextUrl = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
        window.history.replaceState(null, '', nextUrl);
        render(query);
      });
      input.addEventListener('input', function () {
        render(input.value);
      });
    }
  }

  ready(function () {
    initImageFallbacks();
    initMobileMenu();
    initSearchForms();
    initHeroSlider();
    initFilterableGrids();
    initPlayers();
    initSearchPage();
  });
})();
