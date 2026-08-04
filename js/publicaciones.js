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

    const acciones = document.createElement("div");
    acciones.className = "acciones-publicacion";

    const contadorLikes = document.createElement("span");
    contadorLikes.className = "contador-likes";

    const cantidadLikes = Number(post.likes || 0);

    contadorLikes.textContent =
      cantidadLikes === 1
        ? "1 Me gusta"
        : `${cantidadLikes} Me gusta`;

    const botonLike = document.createElement("button");
    botonLike.type = "button";
    botonLike.className = "btn-like";
    botonLike.textContent = "♥";
    botonLike.title = "Me gusta";

    botonLike.setAttribute(
      "aria-label",
      `Dar Me gusta a la publicación de ${post.nombre}`
    );

    botonLike.addEventListener("click", function () {
      incrementLike(post.id);
      renderPosts();
    });

    acciones.appendChild(contadorLikes);
    acciones.appendChild(botonLike);

    li.appendChild(nombre);
    li.appendChild(mensaje);
    li.appendChild(acciones);

    lista.appendChild(li);
  });
}