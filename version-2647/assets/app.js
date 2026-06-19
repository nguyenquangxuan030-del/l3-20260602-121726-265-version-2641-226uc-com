(function () {
  var body = document.body;
  var menuButton = document.querySelector('.menu-toggle');
  if (menuButton) {
    menuButton.addEventListener('click', function () {
      body.classList.toggle('menu-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var current = 0;

  function setSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });
  }

  if (slides.length) {
    var next = document.querySelector('.hero-arrow.next');
    var prev = document.querySelector('.hero-arrow.prev');
    if (next) {
      next.addEventListener('click', function () {
        setSlide(current + 1);
      });
    }
    if (prev) {
      prev.addEventListener('click', function () {
        setSlide(current - 1);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        setSlide(parseInt(dot.getAttribute('data-target') || '0', 10));
      });
    });
    window.setInterval(function () {
      setSlide(current + 1);
    }, 5000);
  }

  function normalize(value) {
    return (value || '').toString().toLowerCase().replace(/\s+/g, '');
  }

  function applyFilter(scope) {
    var input = scope.querySelector('.filter-input');
    var year = scope.querySelector('.filter-year');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-grid article'));
    var query = normalize(input ? input.value : '');
    var selectedYear = year ? year.value : '';
    cards.forEach(function (card) {
      var text = normalize(card.innerText + ' ' + card.getAttribute('data-title') + ' ' + card.getAttribute('data-region') + ' ' + card.getAttribute('data-type') + ' ' + card.getAttribute('data-category'));
      var cardYear = card.getAttribute('data-year') || '';
      var matchedText = !query || text.indexOf(query) !== -1;
      var matchedYear = !selectedYear || cardYear.indexOf(selectedYear) !== -1;
      card.classList.toggle('hidden-card', !(matchedText && matchedYear));
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.filter-bar')).forEach(function (bar) {
    var input = bar.querySelector('.filter-input');
    var year = bar.querySelector('.filter-year');
    if (input) {
      input.addEventListener('input', function () {
        applyFilter(bar);
      });
    }
    if (year) {
      year.addEventListener('change', function () {
        applyFilter(bar);
      });
    }
  });

  var globalSearch = document.getElementById('globalSearch');
  if (globalSearch) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q) {
      globalSearch.value = q;
      var bar = document.querySelector('.global-filter');
      if (bar) {
        applyFilter(bar);
      }
    }
  }

  function loadVideo(video, url, card) {
    if (!video || !url) {
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      if (video._hlsInstance) {
        video._hlsInstance.destroy();
      }
      var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      video._hlsInstance = hls;
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
      hls.on(window.Hls.Events.ERROR, function (_, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.play().catch(function () {});
    } else {
      video.src = url;
      video.play().catch(function () {});
    }
    if (card) {
      card.classList.add('is-playing');
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('.play-trigger')).forEach(function (button) {
    button.addEventListener('click', function () {
      var card = button.closest('.player-card');
      var video = card ? card.querySelector('video') : document.getElementById('videoPlayer');
      loadVideo(video, button.getAttribute('data-video-url'), card);
    });
  });

  var hashPlay = document.querySelector('.detail-actions a[href="#player"]');
  if (hashPlay) {
    hashPlay.addEventListener('click', function () {
      var button = document.querySelector('.play-trigger');
      if (button) {
        window.setTimeout(function () {
          button.click();
        }, 220);
      }
    });
  }
})();
