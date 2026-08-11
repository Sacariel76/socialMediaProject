/**
 * Ordena una copia de las publicaciones según un criterio.
 * Nunca modifica el arreglo original.
 *
 * @param {Array} posts Lista original de publicaciones.
 * @param {string} criterio Criterio: "recientes", "antiguas" o "mas-gustadas".
 * @returns {Array} Copia ordenada de las publicaciones.
 */
function ordenarPublicaciones(posts, criterio) {
  const copia = [...posts];

  switch (criterio) {
    case "antiguas":
      copia.sort((a, b) => {
        const porFecha = new Date(a.fecha) - new Date(b.fecha);
        return porFecha !== 0 ? porFecha : a.id - b.id;
      });
      break;
    case "mas-gustadas":
      copia.sort((a, b) => {
        const porLikes = Number(b.likes || 0) - Number(a.likes || 0);
        return porLikes !== 0 ? porLikes : a.id - b.id;
      });
      break;
    case "recientes":
    default:
      copia.sort((a, b) => {
        const porFecha = new Date(b.fecha) - new Date(a.fecha);
        return porFecha !== 0 ? porFecha : a.id - b.id;
      });
      break;
  }

  return copia;
}

function renderPosts() {
  const lista = document.getElementById("publicaciones");
  lista.innerHTML = "";

  const selector = document.getElementById("orden-publicaciones");
  const criterio = selector ? selector.value : "recientes";

  const posts = ordenarPublicaciones(getPosts(), criterio);

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