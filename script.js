const apiKey = "5bc53758";

const movieInput = document.getElementById("movie-input");
const movieResult = document.getElementById("movie-result");
const watchlistContainer = document.getElementById("watchlist");
const clearWatchlistBtn = document.getElementById("clear-watchlist-btn");
const movieModal = document.getElementById("movie-modal");
const modalBody = document.getElementById("modal-body");
const modalClose = document.getElementById("modal-close");

// Show loading spinner
function showLoading(container) {
  container.innerHTML = '<div class="loading-spinner"></div>';
}

// Hide loading spinner
function hideLoading(container) {
  container.innerHTML = '';
}

// Search movies by title with validation and loading
function searchMovies() {
  const query = movieInput.value.trim();
  if (!query) {
    movieResult.innerHTML = "<p>Please enter a movie title to search.</p>";
    return;
  }
  showLoading(movieResult);
  fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=${apiKey}`)
    .then(response => response.json())
    .then(data => {
      if (data.Response === "True") {
        showMovies(data.Search);
      } else {
        movieResult.innerHTML = "<p>No movies found.</p>";
      }
    })
    .catch(() => {
      movieResult.innerHTML = "<p>Error fetching data. Please try again later.</p>";
    });
}

// Show search results with click event for details
function showMovies(movies) {
  let resultHTML = "";
  movies.forEach(movie => {
    resultHTML += `
      <div class="movie-card" onclick="showMovieDetails('${movie.imdbID}')">
        <img src="${movie.Poster !== "N/A" ? movie.Poster : 'https://via.placeholder.com/200x300'}" alt="${movie.Title} poster">
        <h3>${movie.Title}</h3>
        <p>${movie.Year}</p>
        <button onclick="event.stopPropagation(); addToWatchlist('${movie.imdbID}')">+ Watchlist</button>
      </div>
    `;
  });
  movieResult.innerHTML = resultHTML;
}

// Add movie to watchlist without alert popups
function addToWatchlist(id) {
  fetch(`https://www.omdbapi.com/?i=${id}&apikey=${apiKey}`)
    .then(response => response.json())
    .then(movie => {
      let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
      if (!watchlist.some(item => item.imdbID === movie.imdbID)) {
        watchlist.push(movie);
        localStorage.setItem("watchlist", JSON.stringify(watchlist));
        showWatchlist();
      }
    })
    .catch(() => {
      // silently fail or optionally show a non-intrusive message
    });
}

// Remove movie from watchlist without alert popups
function removeFromWatchlist(id) {
  let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
  let updatedList = watchlist.filter(movie => movie.imdbID !== id);
  localStorage.setItem("watchlist", JSON.stringify(updatedList));
  showWatchlist();
}

// Show watchlist on screen with click event for details
function showWatchlist() {
  let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
  if (watchlist.length === 0) {
    watchlistContainer.innerHTML = "<p>Your watchlist is empty.</p>";
    return;
  }
  let listHTML = "";
  watchlist.forEach(movie => {
    listHTML += `
      <div class="movie-card" onclick="showMovieDetails('${movie.imdbID}')">
        <img src="${movie.Poster !== "N/A" ? movie.Poster : 'https://via.placeholder.com/200x300'}" alt="${movie.Title} poster">
        <h3>${movie.Title}</h3>
        <p>${movie.Year}</p>
        <button onclick="event.stopPropagation(); removeFromWatchlist('${movie.imdbID}')">− Remove</button>
      </div>
    `;
  });
  watchlistContainer.innerHTML = listHTML;
}

// Clear watchlist button handler
clearWatchlistBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to clear your entire watchlist?")) {
    localStorage.removeItem("watchlist");
    showWatchlist();
  }
});

// Show movie details in modal
function showMovieDetails(id) {
  showLoading(modalBody);
  movieModal.style.display = "block";
  fetch(`https://www.omdbapi.com/?i=${id}&apikey=${apiKey}`)
    .then(response => response.json())
    .then(movie => {
      modalBody.innerHTML = `
        <h2>${movie.Title} (${movie.Year})</h2>
        <img src="${movie.Poster !== "N/A" ? movie.Poster : 'https://via.placeholder.com/300x450'}" alt="${movie.Title} poster" style="width: 100%; max-width: 300px; border-radius: 12px; margin-bottom: 15px;">
        <p><strong>Genre:</strong> ${movie.Genre}</p>
        <p><strong>Director:</strong> ${movie.Director}</p>
        <p><strong>Actors:</strong> ${movie.Actors}</p>
        <p><strong>Plot:</strong> ${movie.Plot}</p>
        <p><strong>IMDB Rating:</strong> ${movie.imdbRating}</p>
      `;
    })
    .catch(() => {
      modalBody.innerHTML = "<p>Failed to load movie details. Please try again later.</p>";
    });
}

// Close modal handler
modalClose.addEventListener("click", () => {
  movieModal.style.display = "none";
});

// Close modal when clicking outside modal content
window.addEventListener("click", (event) => {
  if (event.target === movieModal) {
    movieModal.style.display = "none";
  }
});

// Load watchlist when page opens
window.onload = () => {
  showWatchlist();
};
