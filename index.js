const BASE_URL = "https://movie-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/movies/";
const POSTER_URL = BASE_URL + "/posters/";
const MOVIES_PER_PAGE = 12;

const movies = [];
let filteredMovies = [];
const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const paginator = document.querySelector("#paginators");
const changeMode = document.querySelector("#changeMode");
let mode = "card";
let nowPage = 1;

changeMode.addEventListener("click", function onChangeMode(event) {
  if (event.target.matches("#cardMode")) {
    mode = "card";
  } else if (event.target.matches("#listMode")) {
    mode = "list";
  }
  renderMovieList();
});

function renderMovieList() {
  let movieList = getMoviesByPage(nowPage);
  mode === "card"
    ? renderMovieListCardMode(movieList)
    : renderMovieListListMode(movieList);
}

function renderMovieListListMode(data) {
  let rawHTML = "";
  rawHTML += `<table class='table'><tbody>`;
  data.forEach(item => {
    //title, image
    rawHTML += `<tr class="row"><td class="col-10"><h5 class="card-title">${item.title}</h5></td>
                <td class="col-2"><button
                  class="btn btn-primary btn-show-movie"
                  data-id = "${item.id}"
                >More</button> 
                 <button class="btn btn-primary btn-add-favorite" data-id = "${item.id}">+</button></td></tr>`;
  });
  // processing
  rawHTML += `</tbody></table>`;
  dataPanel.innerHTML = rawHTML;
}

function renderMovieListCardMode(data) {
  let rawHTML = "";

  data.forEach(item => {
    //title, image
    rawHTML += `<div class="col-sm-3">
          <div class="mb-2">
            <div class="card">
              <img class="card-img-top" src="${POSTER_URL +
                item.image}" alt="movie poster" />
              <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
              </div>
              <div class="card-footer">
                <button
                  class="btn btn-primary btn-show-movie"
                  data-id = "${item.id}"
                >
                  More
                </button>
                <button class="btn btn-primary btn-add-favorite" data-id = "${
                  item.id
                }">+</button>
              </div>
            </div>
          </div>
        </div>`;
  });
  // processing
  dataPanel.innerHTML = rawHTML;
}

dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(event.target.dataset.id); // 修改這裡
  } else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(event.target.dataset.id));
  }
});

searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  event.preventDefault();
  const keywords = searchInput.value.trim().toLowerCase();

  if (!keywords.length) {
    return alert("Please enter keywords");
  }
  //map , filter, reduce
  filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(keywords)
  );

  if (filteredMovies.length === 0) {
    return alert("Can't find the keywords: " + keywords);
  }

  // for (const movie of movies) {
  //   if (movie.title.toLowerCase().includes(keywords)) {
  //     filteredMovie.push(movie);
  //   }
  // }
  nowPage = 1;
  renderPaginator(filteredMovies.length);
  renderMovieList();
});

function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title");
  const modalImage = document.querySelector("#movie-modal-image");
  const modalDate = document.querySelector("#movie-modal-date");
  const modalDescription = document.querySelector("#movie-modal-description");
  axios.get(INDEX_URL + id).then(response => {
    const data = response.data.results;
    modalTitle.innerText = data.title;
    modalDate.innerText = "Release date: " + data.release_date;
    modalDescription.innerText = data.description;
    modalImage.innerHTML = `<img src="${POSTER_URL +
      data.image}" alt="movie-poster" class="img-fluid">`;
    $("#movie-modal").modal("show");
  });
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
  const movie = movies.find(movie => movie.id === id);
  if (list.some(movie => movie.id === id)) {
    return alert("此電影已經在收藏清單中！");
  }

  list.push(movie);
  localStorage.setItem("favoriteMovies", JSON.stringify(list));
}

function getMoviesByPage(page) {
  //movies ? "movies"80部 : "filterMovie"使用者搜尋
  const data = filteredMovies.length ? filteredMovies : movies;
  //計算起始 index
  const startIndex = (page - 1) * MOVIES_PER_PAGE;
  //回傳切割後的新陣列
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE);
}

function renderPaginator(amount) {
  //計算總頁數
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE);
  //製作 template
  let rawHTML = "";

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="javascript:;" data-page="${page}">${page}</a></li>`;
  }
  //放回 HTML
  paginator.innerHTML = rawHTML;
}

paginator.addEventListener("click", function onPaginatorClicked(event) {
  //如果被點擊的不是 a 標籤，結束
  if (event.target.tagName !== "A") return;

  //透過 dataset 取得被點擊的頁數
  const page = Number(event.target.dataset.page);
  nowPage = Number(event.target.dataset.page);
  //更新畫面
  renderMovieList(getMoviesByPage(page));
});

// axios
//   .get(INDEX_URL)
//   .then(response => {
//     movies.push(...response.data.results);
//     renderMovieList(movies);
//   })
//   .catch(err => console.error);

axios
  .get(INDEX_URL)
  .then(response => {
    movies.push(...response.data.results);
    renderPaginator(movies.length); //新增這裡
    renderMovieList(getMoviesByPage(1)); //修改這裡
  })
  .catch(err => console.log(err));
