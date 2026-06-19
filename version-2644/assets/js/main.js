var MovieSite = (function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var nav = document.querySelector("[data-site-nav]");

        if (!toggle || !nav) {
            return;
        }

        toggle.addEventListener("click", function () {
            var isOpen = nav.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
    }

    function initBackTop() {
        var button = document.querySelector("[data-back-top]");

        if (!button) {
            return;
        }

        window.addEventListener("scroll", function () {
            button.classList.toggle("is-visible", window.scrollY > 360);
        });

        button.addEventListener("click", function () {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");

        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var previous = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });

        if (previous) {
            previous.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initSearchForms() {
        var forms = Array.prototype.slice.call(document.querySelectorAll("[data-site-search]"));

        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();

                var input = form.querySelector("input");
                var query = input ? input.value.trim() : "";
                var target = "./movies.html";

                if (query) {
                    target += "?q=" + encodeURIComponent(query);
                }

                window.location.href = target;
            });
        });
    }

    function initFilters() {
        var page = document.querySelector("[data-filter-page]");

        if (!page) {
            return;
        }

        var input = page.querySelector("[data-filter-search]");
        var genre = page.querySelector("[data-filter-genre]");
        var sort = page.querySelector("[data-filter-sort]");
        var grid = page.querySelector("[data-filter-grid]");
        var empty = page.querySelector("[data-filter-empty]");
        var cards = Array.prototype.slice.call(page.querySelectorAll("[data-movie-card]"));
        var gridButton = page.querySelector("[data-view-grid]");
        var listButton = page.querySelector("[data-view-list]");
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q");

        if (initialQuery && input) {
            input.value = initialQuery;
        }

        function cardMatches(card) {
            var query = input ? input.value.trim().toLowerCase() : "";
            var selectedGenre = genre ? genre.value : "all";
            var haystack = [
                card.getAttribute("data-title") || "",
                card.getAttribute("data-summary") || "",
                card.getAttribute("data-tags") || "",
                card.getAttribute("data-genre") || "",
                card.getAttribute("data-region") || ""
            ].join(" ").toLowerCase();
            var genreText = card.getAttribute("data-genre") || "";
            var typeText = card.getAttribute("data-type") || "";
            var regionText = card.getAttribute("data-region") || "";
            var genreMatched = selectedGenre === "all" || genreText.indexOf(selectedGenre) >= 0 || typeText.indexOf(selectedGenre) >= 0 || regionText.indexOf(selectedGenre) >= 0;

            return (!query || haystack.indexOf(query) >= 0) && genreMatched;
        }

        function sortCards() {
            if (!grid || !sort) {
                return;
            }

            var mode = sort.value;

            cards.sort(function (a, b) {
                if (mode === "year") {
                    return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
                }

                if (mode === "score") {
                    return Number(b.getAttribute("data-score") || 0) - Number(a.getAttribute("data-score") || 0);
                }

                return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
            });

            cards.forEach(function (card) {
                grid.appendChild(card);
            });
        }

        function applyFilters() {
            var visible = 0;

            sortCards();

            cards.forEach(function (card) {
                var matches = cardMatches(card);
                card.style.display = matches ? "" : "none";

                if (matches) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        function setView(type) {
            if (!grid) {
                return;
            }

            grid.classList.toggle("three", type === "grid");
            cards.forEach(function (card) {
                card.classList.toggle("movie-card-list", type === "list");
            });

            if (gridButton) {
                gridButton.classList.toggle("is-active", type === "grid");
            }

            if (listButton) {
                listButton.classList.toggle("is-active", type === "list");
            }
        }

        if (input) {
            input.addEventListener("input", applyFilters);
        }

        if (genre) {
            genre.addEventListener("change", applyFilters);
        }

        if (sort) {
            sort.addEventListener("change", applyFilters);
        }

        if (gridButton) {
            gridButton.addEventListener("click", function () {
                setView("grid");
            });
        }

        if (listButton) {
            listButton.addEventListener("click", function () {
                setView("list");
            });
        }

        setView("grid");
        applyFilters();
    }

    function initPlayer(streamUrl) {
        var video = document.querySelector("[data-player-video]");
        var cover = document.querySelector("[data-player-cover]");
        var button = document.querySelector("[data-player-start]");
        var hlsInstance = null;

        if (!video || !streamUrl) {
            return;
        }

        function attachStream() {
            if (video.getAttribute("data-ready") === "true") {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = streamUrl;
            }

            video.setAttribute("data-ready", "true");
        }

        function play() {
            attachStream();

            if (cover) {
                cover.classList.add("is-hidden");
            }

            video.setAttribute("controls", "controls");
            video.play().catch(function () {});
        }

        if (button) {
            button.addEventListener("click", play);
        }

        if (cover) {
            cover.addEventListener("click", function (event) {
                if (event.target === cover || event.target.closest("[data-player-start]")) {
                    play();
                }
            });
        }

        video.addEventListener("click", function () {
            if (video.getAttribute("data-ready") !== "true") {
                play();
            }
        });

        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    ready(function () {
        initNavigation();
        initBackTop();
        initHero();
        initSearchForms();
        initFilters();
    });

    return {
        initPlayer: initPlayer
    };
})();
