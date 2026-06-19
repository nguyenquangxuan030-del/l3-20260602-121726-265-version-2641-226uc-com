import { searchIndex } from "./search-index.js";

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getQuery() {
  const params = new URLSearchParams(window.location.search);
  return (params.get("q") || "").trim();
}

function renderCard(movie) {
  const tags = movie.tags.slice(0, 3).map(function (tag) {
    return "<span>" + escapeHtml(tag) + "</span>";
  }).join("");

  return `
        <article class="movie-card">
          <a class="poster-link" href="${movie.url}" aria-label="观看${escapeHtml(movie.title)}">
            <img src="${movie.cover}" alt="${escapeHtml(movie.title)}" loading="lazy" />
            <span class="play-badge">▶</span>
          </a>
          <div class="movie-card-body">
            <div class="card-tags">${tags}</div>
            <h3><a href="${movie.url}">${escapeHtml(movie.title)}</a></h3>
            <p>${escapeHtml(movie.oneLine)}</p>
            <div class="movie-meta">
              <span>${escapeHtml(movie.year)}</span>
              <span>${escapeHtml(movie.region)}</span>
              <span>★ ${Number(movie.rating).toFixed(1)}</span>
            </div>
          </div>
        </article>`;
}

function searchMovies(query) {
  if (!query) {
    return searchIndex.slice(0, 48);
  }

  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  return searchIndex.filter(function (movie) {
    const haystack = [
      movie.title,
      movie.region,
      movie.type,
      movie.year,
      movie.genre,
      movie.oneLine,
      movie.tags.join(" ")
    ].join(" ").toLowerCase();

    return words.every(function (word) {
      return haystack.indexOf(word) !== -1;
    });
  }).slice(0, 120);
}

const input = document.getElementById("search-page-input");
const summary = document.getElementById("search-summary");
const results = document.getElementById("search-results");
const query = getQuery();

if (input) {
  input.value = query;
}

const matched = searchMovies(query);

if (summary) {
  summary.textContent = query
    ? `“${query}” 匹配到 ${matched.length} 条结果`
    : "默认展示站内推荐内容";
}

if (results) {
  results.innerHTML = matched.map(renderCard).join("\n");
}
