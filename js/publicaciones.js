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
    botones.appendChild(botonEditar);
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
  textarea.maxLength = 200;

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

    updatePost(post.id, texto);

    renderPosts();
  });

  botonCancelar.addEventListener("click", function () {
    renderPosts();
  });

  textarea.focus();
}