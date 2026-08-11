const LIMITE_MENSAJE = 200;

const estadoFeed = {
  busqueda: "",
  orden: "recientes",
};

function tiempoRelativo(fecha) {
  const minutos = Math.floor((Date.now() - fecha.getTime()) / 60000);

  if (minutos < 1) {
    return "Justo ahora";
  }

  if (minutos < 60) {
    return `Hace ${minutos} min`;
  }

  const horas = Math.floor(minutos / 60);

  if (horas < 24) {
    return `Hace ${horas} h`;
  }

  return fecha.toLocaleDateString("es-CR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

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

/**
 * Obtiene las publicaciones visibles aplicando la búsqueda (H8)
 * y el orden (H9) sin modificar el arreglo guardado.
 *
 * @returns {Array} Copia filtrada y ordenada de las publicaciones.
 */
function obtenerPostsVisibles() {
  let posts = getPosts();

  const busqueda = estadoFeed.busqueda.toLowerCase();

  if (busqueda) {
    posts = posts.filter((post) => {
      return (
        (post.nombre || "").toLowerCase().includes(busqueda) ||
        (post.mensaje || "").toLowerCase().includes(busqueda)
      );
    });
  }

  return ordenarPublicaciones(posts, estadoFeed.orden);
}

/**
 * Actualiza el resumen de actividad (H10) calculando los totales
 * directamente desde el arreglo guardado.
 */
function actualizarResumen() {
  const posts = getPosts();

  const totalPublicaciones = posts.length;
  const totalLikes = posts.reduce(
    (suma, post) => suma + Number(post.likes || 0),
    0
  );
  const totalComentarios = posts.reduce(
    (suma, post) => suma + (post.comentarios ? post.comentarios.length : 0),
    0
  );

  const contPosts = document.getElementById("total-publicaciones");
  const contLikes = document.getElementById("total-likes");
  const contComentarios = document.getElementById("total-comentarios");
  const conteo = document.getElementById("conteo-publicaciones");

  if (contPosts) {
    contPosts.textContent = totalPublicaciones;
  }

  if (contLikes) {
    contLikes.textContent = totalLikes;
  }

  if (contComentarios) {
    contComentarios.textContent = totalComentarios;
  }

  if (conteo) {
    conteo.innerHTML =
      `<strong>${totalPublicaciones}</strong> ` +
      (totalPublicaciones === 1 ? "publicación" : "publicaciones");
  }
}

function crearComentario(comentario) {
  const div = document.createElement("div");
  div.className = "comentario";

  const avatar = document.createElement("span");
  avatar.className = "c-avatar";
  avatar.textContent = (comentario.nombre || "?")
    .trim()
    .charAt(0)
    .toUpperCase();

  const cuerpo = document.createElement("div");
  cuerpo.className = "c-cuerpo";

  const autor = document.createElement("span");
  autor.className = "c-autor";
  autor.textContent = comentario.nombre;

  const texto = document.createElement("span");
  texto.className = "c-texto";
  texto.textContent = comentario.texto;

  const fecha = document.createElement("span");
  fecha.className = "c-fecha";
  fecha.textContent = comentario.fecha
    ? tiempoRelativo(new Date(comentario.fecha))
    : "";

  cuerpo.appendChild(autor);
  cuerpo.appendChild(document.createTextNode(" "));
  cuerpo.appendChild(texto);
  cuerpo.appendChild(fecha);

  div.appendChild(avatar);
  div.appendChild(cuerpo);

  return div;
}

function crearFormularioComentario(post) {
  const form = document.createElement("form");
  form.className = "form-comentario oculto";

  const nombreInput = document.createElement("input");
  nombreInput.type = "text";
  nombreInput.className = "c-nombre";
  nombreInput.placeholder = "Tu nombre";
  nombreInput.maxLength = 50;

  const textoInput = document.createElement("input");
  textoInput.type = "text";
  textoInput.className = "c-texto";
  textoInput.placeholder = "Escribe un comentario...";
  textoInput.maxLength = 200;

  const boton = document.createElement("button");
  boton.type = "submit";
  boton.className = "btn-enviar-comentario";
  boton.textContent = "Comentar";

  const avisoForm = document.createElement("p");
  avisoForm.className = "aviso-comentario";

  form.appendChild(nombreInput);
  form.appendChild(textoInput);
  form.appendChild(boton);
  form.appendChild(avisoForm);

  form.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const nombreTexto = nombreInput.value.trim();
    const comentarioTexto = textoInput.value.trim();

    if (!nombreTexto || !comentarioTexto) {
      avisoForm.textContent = "El nombre y el comentario son obligatorios.";
      return;
    }

    addComment(post.id, {
      nombre: nombreTexto,
      texto: comentarioTexto,
      fecha: new Date().toISOString(),
    });

    renderPosts();
  });

  return form;
}

function crearPublicacion(post) {
  const li = document.createElement("li");
  li.className = "publicacion";

  // Nombre
  const nombre = document.createElement("div");
  nombre.className = "nombre";
  nombre.setAttribute(
    "data-inicial",
    (post.nombre || "?").trim().charAt(0).toUpperCase()
  );
  nombre.textContent = post.nombre;

  // Fecha / hora
  const fecha = post.fecha ? new Date(post.fecha) : null;

  if (fecha) {
    const fechaDiv = document.createElement("div");
    fechaDiv.className = "fecha";
    fechaDiv.textContent = tiempoRelativo(fecha);
    li.appendChild(fechaDiv);
  }

  // Mensaje
  const mensaje = document.createElement("div");
  mensaje.className = "mensaje";
  mensaje.textContent = post.mensaje;

  // Comentarios (H7)
  const contenedorComentarios = document.createElement("div");
  contenedorComentarios.className = "comentarios";

  (post.comentarios || []).forEach((comentario) => {
    contenedorComentarios.appendChild(crearComentario(comentario));
  });

  const formComentario = crearFormularioComentario(post);
  contenedorComentarios.appendChild(formComentario);

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

  // Botón Comentar
  const botonComentar = document.createElement("button");
  botonComentar.type = "button";
  botonComentar.className = "btn-comentar";
  botonComentar.textContent = "Comentar";

  botonComentar.addEventListener("click", function () {
    const oculto = formComentario.classList.toggle("oculto");

    if (!oculto) {
      formComentario.querySelector(".c-nombre").focus();
    }
  });

  // Botón Editar
  const botonEditar = document.createElement("button");
  botonEditar.type = "button";
  botonEditar.className = "btn-editar";
  botonEditar.textContent = "Editar";

  botonEditar.addEventListener("click", function () {
    iniciarEdicion(mensaje, post);
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
  botones.appendChild(botonComentar);
  botones.appendChild(botonEditar);
  botones.appendChild(botonEliminar);

  // Agregar acciones
  acciones.appendChild(contadorLikes);
  acciones.appendChild(botones);

  // Agregar elementos a la publicación
  li.appendChild(nombre);
  li.appendChild(mensaje);
  li.appendChild(contenedorComentarios);
  li.appendChild(acciones);

  return li;
}

function renderPosts() {
  const lista = document.getElementById("publicaciones");

  lista.innerHTML = "";

  const posts = obtenerPostsVisibles();

  if (posts.length === 0) {
    const li = document.createElement("li");
    li.className = "vacio";

    if (getPosts().length === 0) {
      li.textContent = "Aún no hay publicaciones. ¡Sé el primero en publicar!";
    } else {
      li.textContent = "No se encontraron publicaciones para tu búsqueda.";
    }

    lista.appendChild(li);
    actualizarResumen();
    return;
  }

  posts.forEach((post) => {
    lista.appendChild(crearPublicacion(post));
  });

  actualizarResumen();
}

/**
 * Reemplaza el mensaje de una publicación por un área de edición
 * con botones de Guardar y Cancelar.
 *
 * @param {HTMLElement} mensajeDiv Elemento que muestra el mensaje.
 * @param {Object} post Publicación que se está editando.
 */
function iniciarEdicion(mensajeDiv, post) {
  const textarea = document.createElement("textarea");
  textarea.value = post.mensaje;
  textarea.className = "edit-textarea";
  textarea.maxLength = LIMITE_MENSAJE;

  const error = document.createElement("p");
  error.className = "aviso-edicion";

  const botonGuardar = document.createElement("button");
  botonGuardar.type = "button";
  botonGuardar.className = "btn-guardar";
  botonGuardar.textContent = "Guardar";

  const botonCancelar = document.createElement("button");
  botonCancelar.type = "button";
  botonCancelar.className = "btn-cancelar";
  botonCancelar.textContent = "Cancelar";

  const botonesEdicion = document.createElement("div");
  botonesEdicion.className = "botones-edicion";
  botonesEdicion.appendChild(botonGuardar);
  botonesEdicion.appendChild(botonCancelar);

  mensajeDiv.innerHTML = "";
  mensajeDiv.appendChild(textarea);
  mensajeDiv.appendChild(error);
  mensajeDiv.appendChild(botonesEdicion);

  botonGuardar.addEventListener("click", function () {
    const texto = textarea.value.trim();

    if (!texto) {
      error.textContent = "El mensaje no puede estar vacío.";
      textarea.focus();
      return;
    }

    if (texto.length > LIMITE_MENSAJE) {
      error.textContent =
        `El mensaje no puede superar los ${LIMITE_MENSAJE} caracteres.`;
      textarea.focus();
      return;
    }

    updatePost(post.id, texto);

    renderPosts();
  });

  botonCancelar.addEventListener("click", function () {
    renderPosts();
  });

  textarea.focus();
}
