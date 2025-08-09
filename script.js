const apiKey = "5bc53758"; // Replace with your OMDb API key
let currentPage = 1;
let currentSearchTerm = "";

const movieResult = document.getElementById("movie-result");
const movieInput = document.getElementById("movie-input");
const loadMoreBtn = document.getElementById("load-more");
const watchlistContainer = document.getElementById("watchlist");
const clearWatchlistBtn = document.getElementById("clear-watchlist-btn");

// Search on Enter key
movieInput.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    searchMovies(true);
  }
});

// Load more button click
loadMoreBtn.addEventListener("click", () => {
  currentPage++;
  searchMovies(false);
});

// Clear watchlist
clearWatchlistBtn.addEventListener("click", () => {
  localStorage.removeItem("watchlist");
  renderWatchlist();
});

// Movie Search
function searchMovies(reset = true) {
  const query = movieInput.value.trim();

  if (reset) {
    currentSearchTerm = query;
    currentPage = 1;
    movieResult.innerHTML = "";
  }

  if (!query) return;

  fetch(`https://www.omdbapi.com/?apikey=${apiKey}&s=${query}&page=${currentPage}`)
    .then(response => response.json())
    .then(data => {
      if (data.Response === "True") {
        displayMovies(data.Search);

        // Show/hide Load More button
        if (parseInt(data.totalResults) > currentPage * 10) {
          loadMoreBtn.style.display = "block";
        } else {
          loadMoreBtn.style.display = "none";
        }
      } else {
        movieResult.innerHTML = `<p class="error-msg">No results found.</p>`;
        loadMoreBtn.style.display = "none";
      }
    })
    .catch(error => {
      console.error("Fetch error:", error);
    });
}

// Display Movie Cards
function displayMovies(movies) {
  movies.forEach(movie => {
    const movieCard = document.createElement("div");
    movieCard.classList.add("movie-card");

    movieCard.innerHTML = `
      <img src="${movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/300x450?text=No+Image"}" alt="${movie.Title}">
      <h3>${movie.Title}</h3>
      <button class="add-btn" onclick="addToWatchlist('${movie.imdbID}')">+ Watchlist</button>
      <button class="details-btn" onclick="showMovieDetails('${movie.imdbID}')">Details</button>
    `;

    movieResult.appendChild(movieCard);
  });
}

// Add to Watchlist
function addToWatchlist(imdbID) {
  fetch(`https://www.omdbapi.com/?apikey=${apiKey}&i=${imdbID}`)
    .then(response => response.json())
    .then(movie => {
      let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

      if (!watchlist.find(m => m.imdbID === movie.imdbID)) {
        watchlist.push(movie);
        localStorage.setItem("watchlist", JSON.stringify(watchlist));
        renderWatchlist();
      } else {
        alert("This movie is already in your watchlist.");
      }
    });
}

// Remove from Watchlist
function removeFromWatchlist(imdbID) {
  let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
  watchlist = watchlist.filter(movie => movie.imdbID !== imdbID);
  localStorage.setItem("watchlist", JSON.stringify(watchlist));
  renderWatchlist();
}

// Render Watchlist
function renderWatchlist() {
  watchlistContainer.innerHTML = "";
  let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

  if (watchlist.length === 0) {
    watchlistContainer.innerHTML = `<p>Your watchlist is empty.</p>`;
    return;
  }

  watchlist.forEach(movie => {
    const movieCard = document.createElement("div");
    movieCard.classList.add("movie-card");

    movieCard.innerHTML = `
      <img src="${movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/300x450?text=No+Image"}" alt="${movie.Title}">
      <h3>${movie.Title}</h3>
      <button class="remove-btn" onclick="removeFromWatchlist('${movie.imdbID}')">Remove</button>
      <button class="details-btn" onclick="showMovieDetails('${movie.imdbID}')">Details</button>
    `;

    watchlistContainer.appendChild(movieCard);
  });
}

// Show Movie Details in Modal
function showMovieDetails(imdbID) {
  fetch(`https://www.omdbapi.com/?apikey=${apiKey}&i=${imdbID}&plot=full`)
    .then(response => response.json())
    .then(movie => {
      const modal = document.getElementById("movie-modal");
      const modalBody = document.getElementById("modal-body");

      modalBody.innerHTML = `
        <h2>${movie.Title}</h2>
        <p><strong>Year:</strong> ${movie.Year}</p>
        <p><strong>Rated:</strong> ${movie.Rated}</p>
        <p><strong>Released:</strong> ${movie.Released}</p>
        <p><strong>Genre:</strong> ${movie.Genre}</p>
        <p><strong>Director:</strong> ${movie.Director}</p>
        <p><strong>Actors:</strong> ${movie.Actors}</p>
        <p><strong>Plot:</strong> ${movie.Plot}</p>
        <img src="${movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/300x450?text=No+Image"}" alt="${movie.Title}">
      `;

      modal.style.display = "block";
    });
}

document.getElementById("modal-close").onclick = function () {
  document.getElementById("movie-modal").style.display = "none";
};

window.onclick = function (event) {
  const modal = document.getElementById("movie-modal");
  if (event.target === modal) {
    modal.style.display = "none";
  }
};

// Initial Render
renderWatchlist();
