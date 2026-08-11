function renderPosts() {
  const lista = document.getElementById("publicaciones");

  lista.innerHTML = "";

  const posts = getPosts();

  posts.forEach((post) => {
    const li = document.createElement("li");
    li.className = "publicacion";

    // Nombre
    const nombre = document.createElement("div");
    nombre.className = "nombre";
    nombre.textContent = post.nombre;

    // Mensaje
    const mensaje = document.createElement("div");
    mensaje.className = "mensaje";
    mensaje.textContent = post.mensaje;

    // Contenedor de acciones
    const acciones = document.createElement("div");
    acciones.className = "acciones-publicacion";

    // Contador de Me gusta
    const contadorLikes = document.createElement("span");
    contadorLikes.className = "contador-likes";

    const cantidadLikes = Number(post.likes || 0);

    contadorLikes.textContent =
      cantidadLikes === 1
        ? "1 Me gusta"
        : `${cantidadLikes} Me gusta`;

    // Contenedor de botones
    const botones = document.createElement("div");
    botones.className = "botones-publicacion";

    // Botón Me gusta
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

    // Botón Eliminar
    const botonEliminar = document.createElement("button");
    botonEliminar.type = "button";
    botonEliminar.className = "btn-eliminar";
    botonEliminar.textContent = "Eliminar";

    botonEliminar.addEventListener("click", function () {
      const confirmar = window.confirm(
        "¿Está seguro de que desea eliminar esta publicación?"
      );

      if (!confirmar) {
        return;
      }

      deletePost(post.id);

      renderPosts();
    });

    // Agregar botones
    botones.appendChild(botonLike);
    botones.appendChild(botonEliminar);

    // Agregar acciones
    acciones.appendChild(contadorLikes);
    acciones.appendChild(botones);

    // Agregar elementos a la publicación
    li.appendChild(nombre);
    li.appendChild(mensaje);
    li.appendChild(acciones);

    lista.appendChild(li);
  });
}