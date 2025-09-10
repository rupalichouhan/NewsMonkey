// index.js

const apiKey = "35e456886a1d408dbfee29575dd33f3a";

document.addEventListener("DOMContentLoaded", () => {
    const newsContainer = document.getElementById("news-container");
    const searchButton = document.getElementById("searchButton");
    const searchInput = document.getElementById("searchInput");
    const darkModeToggle = document.getElementById("darkModeToggle");
    const categories = ["general", "business", "sports", "technology", "entertainment"];

    // Restore dark-mode preference
    if (localStorage.getItem("dark-mode") === "true") {
        document.body.classList.add("dark-mode");
        darkModeToggle.innerText = "☀️";
    }

    // Dark-mode toggle handler
    const toggleDarkMode = () => {
        const isDark = document.body.classList.toggle("dark-mode");
        localStorage.setItem("dark-mode", isDark ? "true" : "false");
        darkModeToggle.innerText = isDark ? "☀️" : "🌙";
    };
    darkModeToggle?.addEventListener("click", toggleDarkMode);

    // Loader helper
    function showLoader(show) {
        const loader = document.getElementById("loader");
        if (!loader) return;
        loader.style.display = show ? "block" : "none";
    }

    // Fetch top headlines
    async function fetchNews(category) {
        newsContainer.innerHTML = `<p class="text-center">Loading ${category} news...</p>`;
        showLoader(true);

        try {
            const url = `https://newsapi.org/v2/top-headlines?country=us&category=${category}&apiKey=${apiKey}`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.status !== "ok") {
                newsContainer.innerHTML = `<p class="text-danger text-center">Error: ${data.message}</p>`;
                return;
            }
            if (data.articles.length === 0) {
                newsContainer.innerHTML = `<p class="text-center">No news found for ${category}.</p>`;
                return;
            }
            renderNews(data.articles);
        } catch (err) {
            console.error(err);
            newsContainer.innerHTML = `<p class="text-danger text-center">Failed to load news. Try again later.</p>`;
        } finally {
            showLoader(false);
        }
    }

    // Fetch search results
    async function fetchSearchResults(query) {
        newsContainer.innerHTML = `<p class="text-center">Searching for “${query}”…</p>`;
        showLoader(true);

        try {
            const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&language=en&apiKey=${apiKey}`;
            const response = await fetch(url);
            const data = await response.json();

            if (!data.articles.length) {
                newsContainer.innerHTML = `<p class="text-center">No results found for “${query}”.</p>`;
                return;
            }
            renderNews(data.articles);
        } catch (err) {
            console.error(err);
            newsContainer.innerHTML = `<p class="text-danger text-center">Search failed. Try again later.</p>`;
        } finally {
            showLoader(false);
        }
    }

    // Render articles grid
    function renderNews(articles) {
        newsContainer.innerHTML = "";
        const top3 = articles.slice(0, 3);
        const rest = articles.slice(3);

        // Top 3 headlines
        const topRow = document.createElement("div");
        topRow.className = "top-news row mb-4";
        top3.forEach((a) => {
            const imgSrc = a.urlToImage || "https://via.placeholder.com/600x300?text=No+Image";
            const col = document.createElement("div");
            col.className = "col-md-4 mb-3";
            col.innerHTML = `
                <div class="highlight card p-3 h-100">
                  <h3>${a.title}</h3>
                  <img src="${imgSrc}" class="img-fluid mb-2" alt="${a.title}">
                  <p class="text-muted mb-1">
                    ${a.source.name || "Unknown Source"} | ${new Date(a.publishedAt).toLocaleString()}
                  </p>
                  <p>${a.description || ""}</p>
                  <a href="${a.url}" target="_blank" class="btn btn-outline-primary mt-auto">Read More</a>
                </div>`;
            topRow.appendChild(col);
        });
        newsContainer.appendChild(topRow);

        // Remaining articles in rows of 3
        for (let i = 0; i < rest.length; i += 3) {
            const row = document.createElement("div");
            row.className = "row";
            rest.slice(i, i + 3).forEach((a) => {
                const imgSrc = a.urlToImage || "https://via.placeholder.com/600x300?text=No+Image";
                const col = document.createElement("div");
                col.className = "col-md-4 mb-4";
                col.innerHTML = `
                    <div class="card h-100 shadow-sm">
                      <img src="${imgSrc}" class="card-img-top" alt="${a.title}">
                      <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${a.title}</h5>
                        <p class="text-muted mb-1">
                          ${a.source.name || "Unknown Source"} | ${new Date(a.publishedAt).toLocaleString()}
                        </p>
                        <p class="card-text">${a.description || "No Description Available."}</p>
                        <a href="${a.url}" target="_blank" class="btn btn-primary mt-auto">Read More</a>
                      </div>
                    </div>`;
                row.appendChild(col);
            });
            newsContainer.appendChild(row);
        }
    }

    // Attach category click handlers
    categories.forEach((cat) => {
        const btn = document.getElementById(cat);
        if (!btn) console.warn(`No button found with id="${cat}"`);
        else {
            btn?.addEventListener("click", (e) => {
                e.preventDefault();
                categories.forEach(c => {
                    const el = document.getElementById(c);
                    el?.classList.remove("active", "btn-primary");
                    el?.classList.add("btn-link");
                });

                btn.classList.remove("btn-link");
                btn.classList.add("active", "btn-primary");

                fetchNews(cat);
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
        }
    });

    // Attach search and Enter-key handlers
    searchButton?.addEventListener("click", () => {
        const q = searchInput.value.trim();
        if (q) {
            categories.forEach(c => document.getElementById(c)?.classList.remove("active"));
            fetchSearchResults(q);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    });
    searchInput?.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            searchButton.click();
        }
    });

    fetchNews("general");
    // Highlight "General" button on load
    const defaultBtn = document.getElementById("general");
    defaultBtn?.classList.add("active", "btn-primary");
    defaultBtn?.classList.remove("btn-link");

});
