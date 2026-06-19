document.addEventListener("DOMContentLoaded", () => {
    const nav = document.querySelector(".main-nav");
    const toggle = document.querySelector(".mobile-toggle");

    if (nav && toggle) {
        toggle.addEventListener("click", () => {
            nav.classList.toggle("is-open");
        });
    }

    const hero = document.querySelector("[data-hero]");

    if (hero) {
        const slides = Array.from(hero.querySelectorAll(".hero-slide"));
        const dots = Array.from(hero.querySelectorAll(".hero-dot"));
        const prev = hero.querySelector("[data-hero-prev]");
        const next = hero.querySelector("[data-hero-next]");
        let active = 0;
        let timer;

        const show = index => {
            if (!slides.length) {
                return;
            }

            active = (index + slides.length) % slides.length;
            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle("is-active", slideIndex === active);
            });
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle("is-active", dotIndex === active);
            });
        };

        const start = () => {
            timer = window.setInterval(() => show(active + 1), 5200);
        };

        const restart = () => {
            window.clearInterval(timer);
            start();
        };

        dots.forEach((dot, dotIndex) => {
            dot.addEventListener("click", () => {
                show(dotIndex);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener("click", () => {
                show(active - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", () => {
                show(active + 1);
                restart();
            });
        }

        show(0);
        start();
    }

    document.querySelectorAll("[data-filter-panel]").forEach(panel => {
        const cards = Array.from(document.querySelectorAll("[data-movie-card]"));
        const input = panel.querySelector("[data-filter-input]");
        const selects = Array.from(panel.querySelectorAll("[data-filter-field]"));
        const count = document.querySelector("[data-result-count]");
        const empty = document.querySelector("[data-empty-state]");
        const params = new URLSearchParams(window.location.search);
        const query = params.get("q");

        if (input && query) {
            input.value = query;
        }

        const apply = () => {
            const keyword = input ? input.value.trim().toLowerCase() : "";
            let visible = 0;

            cards.forEach(card => {
                const text = (card.dataset.search || "").toLowerCase();
                const keywordMatched = !keyword || text.includes(keyword);
                const selectMatched = selects.every(select => {
                    const value = select.value;
                    const field = select.dataset.filterField;
                    return !value || card.dataset[field] === value;
                });
                const matched = keywordMatched && selectMatched;

                card.style.display = matched ? "" : "none";
                if (matched) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = `共 ${visible} 部影片`;
            }

            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        };

        if (input) {
            input.addEventListener("input", apply);
        }

        selects.forEach(select => {
            select.addEventListener("change", apply);
        });

        apply();
    });

    const backTop = document.querySelector(".back-top");

    if (backTop) {
        const toggleTop = () => {
            backTop.classList.toggle("is-visible", window.scrollY > 460);
        };

        window.addEventListener("scroll", toggleTop);
        backTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
        toggleTop();
    }
});
