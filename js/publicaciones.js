function renderPosts() {
  const lista = document.getElementById("publicaciones");
  lista.innerHTML = "";

  const posts = getPosts();
  posts.forEach((post) => {
    const li = document.createElement("li");
    li.className = "publicacion";

    const nombre = document.createElement("div");
    nombre.className = "nombre";
    nombre.textContent = post.nombre;

    const mensaje = document.createElement("div");
    mensaje.className = "mensaje";
    mensaje.textContent = post.mensaje;

    li.appendChild(nombre);
    li.appendChild(mensaje);
    lista.appendChild(li);
  });
}
