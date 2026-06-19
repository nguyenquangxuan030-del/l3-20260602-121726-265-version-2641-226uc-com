(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobilePanel = document.querySelector(".mobile-panel");

    if (menuButton && mobilePanel) {
      menuButton.addEventListener("click", function () {
        var isOpen = mobilePanel.hasAttribute("hidden") === false;
        if (isOpen) {
          mobilePanel.setAttribute("hidden", "");
          menuButton.setAttribute("aria-expanded", "false");
        } else {
          mobilePanel.removeAttribute("hidden");
          menuButton.setAttribute("aria-expanded", "true");
        }
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === activeIndex);
      });
    }

    function startHero() {
      if (slides.length <= 1) {
        return;
      }
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        startHero();
      });
    });

    showSlide(0);
    startHero();

    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
      var buttons = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-key]"));
      var list = scope.parentElement.querySelector("[data-filter-list]");
      var cards = list ? Array.prototype.slice.call(list.querySelectorAll(".movie-card")) : [];

      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          var key = button.getAttribute("data-filter-key");
          var value = button.getAttribute("data-filter-value");

          buttons.forEach(function (item) {
            item.classList.toggle("is-active", item === button);
          });

          cards.forEach(function (card) {
            var visible = key === "all" || card.getAttribute("data-" + key) === value;
            card.style.display = visible ? "" : "none";
          });
        });
      });
    });
  });
})();
