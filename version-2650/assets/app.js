(function () {
  function byId(id) {
    return document.getElementById(id);
  }

  var menuButton = byId("menuToggle");
  var mainNav = byId("mainNav");

  if (menuButton && mainNav) {
    menuButton.addEventListener("click", function () {
      mainNav.classList.toggle("open");
    });
  }

  var hero = byId("heroCarousel");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });

      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  var searchInput = byId("movieSearch");
  var yearFilter = byId("yearFilter");
  var categoryFilter = byId("categoryFilter");
  var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-grid .movie-card"));

  if (cards.length && yearFilter) {
    var years = cards
      .map(function (card) {
        return card.getAttribute("data-year") || "";
      })
      .filter(Boolean)
      .filter(function (value, position, array) {
        return array.indexOf(value) === position;
      })
      .sort(function (a, b) {
        return Number(b) - Number(a);
      });

    years.forEach(function (year) {
      var option = document.createElement("option");
      option.value = year;
      option.textContent = year;
      yearFilter.appendChild(option);
    });
  }

  function filterCards() {
    var term = searchInput ? searchInput.value.trim().toLowerCase() : "";
    var year = yearFilter ? yearFilter.value : "";
    var category = categoryFilter ? categoryFilter.value : "";

    cards.forEach(function (card) {
      var text = [
        card.getAttribute("data-title"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-region"),
        card.getAttribute("data-tags"),
        card.getAttribute("data-category")
      ].join(" ").toLowerCase();
      var matchedTerm = !term || text.indexOf(term) !== -1;
      var matchedYear = !year || card.getAttribute("data-year") === year;
      var cardCategory = card.getAttribute("data-category") || "";
      var matchedCategory = !category || cardCategory === category;
      card.classList.toggle("is-hidden", !(matchedTerm && matchedYear && matchedCategory));
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", filterCards);
  }

  if (yearFilter) {
    yearFilter.addEventListener("change", filterCards);
  }

  if (categoryFilter) {
    categoryFilter.addEventListener("change", filterCards);
  }

  window.initStaticPlayer = function (videoUrl) {
    var video = byId("movieVideo");
    var button = byId("playButton");

    if (!video || !button || !videoUrl) {
      return;
    }

    var shell = video.closest(".player-shell");
    var loaded = false;

    function loadVideo() {
      if (!loaded) {
        loaded = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = videoUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(videoUrl);
          hls.attachMedia(video);
        } else {
          video.src = videoUrl;
        }
      }

      if (shell) {
        shell.classList.add("is-playing");
      }

      video.play().catch(function () {});
    }

    button.addEventListener("click", loadVideo);
    video.addEventListener("click", function () {
      if (!loaded) {
        loadVideo();
      }
    });
  };
})();
