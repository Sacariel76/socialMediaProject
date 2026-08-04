const STORAGE_KEY = "publicaciones";

function getPosts() {
  const datos = localStorage.getItem(STORAGE_KEY);
  return datos ? JSON.parse(datos) : [];
}

function savePost(post) {
  const posts = getPosts();
  posts.push(post);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}
