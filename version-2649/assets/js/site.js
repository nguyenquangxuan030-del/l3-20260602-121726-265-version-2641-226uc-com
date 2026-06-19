(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
            return;
        }
        document.addEventListener('DOMContentLoaded', fn);
    }

    ready(function () {
        var menuButton = document.querySelector('[data-menu-toggle]');
        var mobileMenu = document.querySelector('[data-mobile-menu]');
        if (menuButton && mobileMenu) {
            menuButton.addEventListener('click', function () {
                mobileMenu.classList.toggle('open');
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        var prev = document.querySelector('[data-hero-prev]');
        var next = document.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

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

        function startHero() {
            if (timer || slides.length < 2) {
                return;
            }
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        function restartHero() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
            startHero();
        }

        if (slides.length) {
            showSlide(0);
            startHero();
            if (prev) {
                prev.addEventListener('click', function () {
                    showSlide(current - 1);
                    restartHero();
                });
            }
            if (next) {
                next.addEventListener('click', function () {
                    showSlide(current + 1);
                    restartHero();
                });
            }
            dots.forEach(function (dot) {
                dot.addEventListener('click', function () {
                    showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                    restartHero();
                });
            });
        }

        var filterRoot = document.querySelector('[data-filter-root]');
        var filterList = document.querySelector('[data-filter-list]');
        if (filterRoot && filterList) {
            var keywordInput = filterRoot.querySelector('[data-filter-keyword]');
            var categorySelect = filterRoot.querySelector('[data-filter-category]');
            var regionSelect = filterRoot.querySelector('[data-filter-region]');
            var typeSelect = filterRoot.querySelector('[data-filter-type]');
            var cards = Array.prototype.slice.call(filterList.querySelectorAll('.movie-card'));
            var params = new URLSearchParams(window.location.search);
            var initialKeyword = params.get('q') || '';
            if (keywordInput && initialKeyword) {
                keywordInput.value = initialKeyword;
            }

            function textOf(card) {
                return [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-region') || '',
                    card.getAttribute('data-year') || '',
                    card.getAttribute('data-type') || '',
                    card.getAttribute('data-category') || '',
                    card.innerText || ''
                ].join(' ').toLowerCase();
            }

            function applyFilters() {
                var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
                var category = categorySelect ? categorySelect.value : '';
                var region = regionSelect ? regionSelect.value : '';
                var type = typeSelect ? typeSelect.value : '';
                cards.forEach(function (card) {
                    var ok = true;
                    if (keyword && textOf(card).indexOf(keyword) === -1) {
                        ok = false;
                    }
                    if (category && card.getAttribute('data-category') !== category) {
                        ok = false;
                    }
                    if (region && card.getAttribute('data-region') !== region) {
                        ok = false;
                    }
                    if (type && card.getAttribute('data-type') !== type) {
                        ok = false;
                    }
                    card.classList.toggle('is-hidden', !ok);
                });
            }

            [keywordInput, categorySelect, regionSelect, typeSelect].forEach(function (node) {
                if (node) {
                    node.addEventListener('input', applyFilters);
                    node.addEventListener('change', applyFilters);
                }
            });
            applyFilters();
        }

        var playButton = document.querySelector('[data-play-trigger]');
        var video = document.querySelector('[data-player-video]');
        if (playButton && video) {
            playButton.addEventListener('click', function () {
                var src = playButton.getAttribute('data-stream');
                if (!src) {
                    return;
                }
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = src;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls();
                    hls.loadSource(src);
                    hls.attachMedia(video);
                } else {
                    video.src = src;
                }
                playButton.classList.add('hidden');
                var started = video.play();
                if (started && typeof started.catch === 'function') {
                    started.catch(function () {});
                }
            });

            video.addEventListener('click', function () {
                if (video.paused) {
                    var started = video.play();
                    if (started && typeof started.catch === 'function') {
                        started.catch(function () {});
                    }
                }
            });
        }
    });
})();
