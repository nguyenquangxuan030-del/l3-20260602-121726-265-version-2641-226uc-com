(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
      toggle.textContent = nav.classList.contains("is-open") ? "×" : "☰";
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    show(0);
    start();
  }

  function setupMovieTools() {
    var toolGroups = Array.prototype.slice.call(document.querySelectorAll("[data-movie-tools]"));
    toolGroups.forEach(function (tools) {
      var container = tools.parentElement;
      var searchInput = tools.querySelector("[data-search-input]");
      var buttons = Array.prototype.slice.call(tools.querySelectorAll("[data-filter-button]"));
      var activeFilter = "all";
      var cards = Array.prototype.slice.call(container.querySelectorAll("[data-movie-card]"));

      function matchesFilter(card) {
        var type = (card.getAttribute("data-type") || "").toLowerCase();
        var year = parseInt(card.getAttribute("data-year") || "0", 10);
        if (activeFilter === "movie") {
          return type.indexOf("电影") !== -1;
        }
        if (activeFilter === "series") {
          return type.indexOf("剧") !== -1;
        }
        if (activeFilter === "new") {
          return year >= 2024;
        }
        if (activeFilter === "classic") {
          return year > 0 && year <= 2010;
        }
        return true;
      }

      function apply() {
        var keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-tags") || "",
            card.getAttribute("data-region") || "",
            card.getAttribute("data-type") || "",
            card.getAttribute("data-year") || ""
          ].join(" ").toLowerCase();
          var visible = (!keyword || text.indexOf(keyword) !== -1) && matchesFilter(card);
          card.classList.toggle("is-filtered-out", !visible);
        });
      }

      if (searchInput) {
        searchInput.addEventListener("input", apply);
      }

      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          activeFilter = button.getAttribute("data-filter-button") || "all";
          buttons.forEach(function (item) {
            item.classList.toggle("is-active", item === button);
          });
          apply();
        });
      });

      apply();
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupMovieTools();
  });
})();

function setupPlayer(streamUrl) {
  var video = document.querySelector("[data-video-player]");
  var trigger = document.querySelector("[data-player-trigger]");
  var hlsInstance = null;
  var hasLoaded = false;

  if (!video || !trigger || !streamUrl) {
    return;
  }

  function attachStream() {
    if (hasLoaded) {
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
    hasLoaded = true;
  }

  function play() {
    attachStream();
    trigger.classList.add("is-hidden");
    var attempt = video.play();
    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(function () {});
    }
  }

  trigger.addEventListener("click", play);
  video.addEventListener("click", function () {
    if (!hasLoaded) {
      play();
    }
  });
  window.addEventListener("beforeunload", function () {
    if (hlsInstance && typeof hlsInstance.destroy === "function") {
      hlsInstance.destroy();
    }
  });
}
