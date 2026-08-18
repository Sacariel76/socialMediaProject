const LIMITE_MENSAJE = 200;

/** Cantidad máxima de publicaciones que se muestran por página (H18). */
const PUBLICACIONES_POR_PAGINA = 5;

/** Motivos de reporte con su nombre visible (H20). */
const MOTIVOS = [
  { valor: "spam", texto: "Spam" },
  { valor: "ofensivo", texto: "Ofensivo" },
  { valor: "otro", texto: "Otro" },
];

/**
 * Reacciones disponibles (H13) con su icono, etiqueta y el id
 * del contador que les corresponde en el resumen de actividad.
 */
const REACCIONES = [
  { tipo: "megusta", icono: "👍", etiqueta: "Me gusta", idResumen: "total-likes" },
  { tipo: "meencanta", icono: "❤️", etiqueta: "Me encanta", idResumen: "total-meencanta" },
  { tipo: "medivierte", icono: "😄", etiqueta: "Me divierte", idResumen: "total-medivierte" },
];

const estadoFeed = {
  busqueda: "",
  orden: "recientes",
  etiqueta: "todas",
  soloFavoritas: false,
  pagina: 1,
};

/**
 * Devuelve el nombre visible de una etiqueta (H15).
 *
 * @param {string} etiqueta Etiqueta en minúsculas.
 * @returns {string} Nombre con mayúscula inicial.
 */
function formatearEtiqueta(etiqueta) {
  return etiqueta.charAt(0).toUpperCase() + etiqueta.slice(1);
}

/**
 * Devuelve el nombre visible de un motivo de reporte (H20).
 *
 * @param {string} motivo Motivo guardado: spam, ofensivo u otro.
 * @returns {string} Nombre con mayúscula inicial.
 */
function formatearMotivo(motivo) {
  const encontrado = MOTIVOS.find((opcion) => opcion.valor === motivo);

  return encontrado ? encontrado.texto : formatearEtiqueta(motivo || "otro");
}

/**
 * Acorta un mensaje para mostrarlo en la vista Moderación (H20).
 *
 * @param {string} mensaje Mensaje completo de la publicación.
 * @returns {string} Mensaje recortado.
 */
function resumirMensaje(mensaje) {
  const texto = String(mensaje || "");

  return texto.length > 120 ? `${texto.slice(0, 120)}…` : texto;
}

/**
 * Lee la cantidad de una reacción de una publicación (H13).
 * Devuelve cero cuando la propiedad no existe, de modo que las
 * publicaciones antiguas se muestran sin errores.
 *
 * @param {Object} post Publicación que se desea consultar.
 * @param {string} tipo Tipo de reacción.
 * @returns {number} Cantidad de esa reacción.
 */
function obtenerCantidadReaccion(post, tipo) {
  const reacciones = post.reacciones || {};

  const cantidad =
    tipo === "megusta" && reacciones.megusta === undefined
      ? post.likes
      : reacciones[tipo];

  const numero = Number(cantidad);

  return Number.isFinite(numero) && numero > 0 ? Math.floor(numero) : 0;
}

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
 * Muestra la fecha y hora completas de una respuesta (H14).
 *
 * @param {string} valorFecha Fecha almacenada en formato ISO.
 * @returns {string} Fecha y hora local, o una cadena vacía si no es válida.
 */
function formatearFechaHora(valorFecha) {
  const fecha = new Date(valorFecha);

  if (Number.isNaN(fecha.getTime())) {
    return "";
  }

  return fecha.toLocaleString("es-CR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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
 * Obtiene las publicaciones visibles aplicando la búsqueda (H8),
 * el orden (H9), el filtro por etiqueta (H15) y Favoritos (H16)
 * sin modificar el arreglo guardado.
 *
 * @returns {Array} Copia filtrada y ordenada de las publicaciones.
 */
function obtenerPostsVisibles() {
  let posts = getPosts();

  const busqueda = estadoFeed.busqueda.toLowerCase();
  const etiquetaFiltro = estadoFeed.etiqueta;

  if (busqueda) {
    posts = posts.filter((post) => {
      return (
        (post.nombre || "").toLowerCase().includes(busqueda) ||
        (post.mensaje || "").toLowerCase().includes(busqueda)
      );
    });
  }

  if (etiquetaFiltro !== "todas") {
    posts = posts.filter((post) => {
      return post.etiqueta === etiquetaFiltro;
    });
  }

  if (estadoFeed.soloFavoritas) {
    posts = posts.filter((post) => post.favorita === true);
  }

  return ordenarPublicaciones(posts, estadoFeed.orden);
}

/**
 * Calcula la porción de publicaciones que corresponde mostrar (H18).
 * Ajusta la página actual cuando queda fuera de rango, por ejemplo al
 * eliminar la última publicación de una página o al buscar, filtrar u
 * ordenar desde una página avanzada.
 *
 * @param {number} total Cantidad de publicaciones visibles.
 * @returns {{ totalPaginas: number, pagina: number, inicio: number, fin: number }}
 */
function calcularPaginacion(total) {
  const totalPaginas = Math.max(
    1,
    Math.ceil(total / PUBLICACIONES_POR_PAGINA)
  );

  const pagina = Math.min(
    Math.max(1, estadoFeed.pagina),
    totalPaginas
  );

  estadoFeed.pagina = pagina;

  const inicio = (pagina - 1) * PUBLICACIONES_POR_PAGINA;

  return {
    totalPaginas,
    pagina,
    inicio,
    fin: inicio + PUBLICACIONES_POR_PAGINA,
  };
}

/**
 * Actualiza el indicador y los botones de paginación (H18).
 *
 * @param {number} pagina Página que se está mostrando.
 * @param {number} totalPaginas Cantidad total de páginas.
 * @param {number} totalVisibles Publicaciones que cumplen los filtros.
 */
function renderPaginacion(pagina, totalPaginas, totalVisibles) {
  const barra = document.getElementById("paginacion");
  const anterior = document.getElementById("pagina-anterior");
  const siguiente = document.getElementById("pagina-siguiente");
  const indicador = document.getElementById("indicador-pagina");

  if (!barra || !anterior || !siguiente || !indicador) {
    return;
  }

  barra.classList.toggle("oculto", totalVisibles === 0);

  indicador.textContent = `Página ${pagina} de ${totalPaginas}`;

  anterior.disabled = pagina <= 1;
  siguiente.disabled = pagina >= totalPaginas;
}

/**
 * Actualiza el resumen de actividad (H10) calculando los totales
 * directamente desde el arreglo guardado.
 */
function actualizarResumen() {
  const posts = getPosts();

  const totalPublicaciones = posts.length;
  const totalComentarios = posts.reduce(
    (suma, post) => suma + (post.comentarios ? post.comentarios.length : 0),
    0
  );

  const contPosts = document.getElementById("total-publicaciones");
  const contComentarios = document.getElementById("total-comentarios");
  const conteo = document.getElementById("conteo-publicaciones");

  if (contPosts) {
    contPosts.textContent = totalPublicaciones;
  }

  // Totales por tipo de reacción (H13)
  REACCIONES.forEach((reaccion) => {
    const total = posts.reduce(
      (suma, post) => suma + obtenerCantidadReaccion(post, reaccion.tipo),
      0
    );

    const contador = document.getElementById(reaccion.idResumen);

    if (contador) {
      contador.textContent = total;
    }
  });

  if (contComentarios) {
    contComentarios.textContent = totalComentarios;
  }

  if (conteo) {
    conteo.innerHTML =
      `<strong>${totalPublicaciones}</strong> ` +
      (totalPublicaciones === 1 ? "publicación" : "publicaciones");
  }
}

/**
 * Crea el botón que despliega un formulario de respuesta.
 *
 * @param {HTMLFormElement} formulario Formulario asociado al elemento.
 * @param {string} autor Nombre del autor al que se responde.
 * @returns {HTMLButtonElement} Botón configurado.
 */
function crearBotonResponder(formulario, autor) {
  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = "btn-responder";
  boton.textContent = "Responder";
  boton.setAttribute("aria-expanded", "false");
  boton.setAttribute(
    "aria-label",
    `Responder a ${autor || "autor desconocido"}`
  );

  boton.addEventListener("click", function () {
    const oculto = formulario.classList.toggle("oculto");
    boton.setAttribute("aria-expanded", String(!oculto));

    if (!oculto) {
      formulario.querySelector(".r-nombre-input").focus();
    }
  });

  return boton;
}

/**
 * Crea recursivamente una respuesta y todas sus descendientes.
 * Se utiliza textContent para que el contenido del usuario no se interprete
 * como HTML.
 *
 * @param {Object} respuesta Respuesta que se desea mostrar.
 * @param {number} postId Identificador de la publicación.
 * @returns {HTMLElement} Hilo de la respuesta.
 */
function crearRespuesta(respuesta, postId) {
  const hilo = document.createElement("div");
  hilo.className = "hilo-respuesta";

  const div = document.createElement("div");
  div.className = "respuesta";

  const avatar = document.createElement("span");
  avatar.className = "r-avatar";
  avatar.textContent = (respuesta.nombre || "?")
    .trim()
    .charAt(0)
    .toUpperCase();

  const cuerpo = document.createElement("div");
  cuerpo.className = "r-cuerpo";

  const autor = document.createElement("span");
  autor.className = "r-autor";
  autor.textContent = respuesta.nombre || "";

  const texto = document.createElement("span");
  texto.className = "r-texto";
  texto.textContent = respuesta.texto || "";

  const fecha = document.createElement("span");
  fecha.className = "r-fecha";
  fecha.textContent = formatearFechaHora(respuesta.fecha);

  const formulario = crearFormularioRespuesta(
    postId,
    respuesta.id
  );

  const acciones = document.createElement("div");
  acciones.className = "r-acciones";
  acciones.appendChild(
    crearBotonResponder(formulario, respuesta.nombre)
  );

  cuerpo.appendChild(autor);
  cuerpo.appendChild(document.createTextNode(" "));
  cuerpo.appendChild(texto);
  cuerpo.appendChild(fecha);
  cuerpo.appendChild(acciones);

  div.appendChild(avatar);
  div.appendChild(cuerpo);

  const respuestas = document.createElement("div");
  respuestas.className = "respuestas respuestas-anidadas";

  (respuesta.respuestas || []).forEach((respuestaHija) => {
    respuestas.appendChild(
      crearRespuesta(respuestaHija, postId)
    );
  });

  respuestas.appendChild(formulario);
  hilo.appendChild(div);
  hilo.appendChild(respuestas);

  return hilo;
}

/**
 * Crea y valida el formulario para responder un comentario o respuesta.
 *
 * @param {number} postId Identificador de la publicación.
 * @param {string} elementoPadreId Id del comentario o respuesta padre.
 * @returns {HTMLFormElement} Formulario listo para insertarse.
 */
function crearFormularioRespuesta(postId, elementoPadreId) {
  const form = document.createElement("form");
  form.className = "form-respuesta oculto";
  form.noValidate = true;

  const nombreInput = document.createElement("input");
  nombreInput.type = "text";
  nombreInput.className = "r-nombre-input";
  nombreInput.placeholder = "Tu nombre";
  nombreInput.maxLength = LIMITE_NOMBRE_RESPUESTA;
  nombreInput.required = true;
  nombreInput.autocomplete = "name";
  nombreInput.setAttribute("aria-label", "Nombre de quien responde");

  const textoInput = document.createElement("input");
  textoInput.type = "text";
  textoInput.className = "r-texto-input";
  textoInput.placeholder = "Escribe una respuesta...";
  textoInput.maxLength = LIMITE_TEXTO_RESPUESTA;
  textoInput.required = true;
  textoInput.setAttribute("aria-label", "Texto de la respuesta");

  const boton = document.createElement("button");
  boton.type = "submit";
  boton.className = "btn-enviar-respuesta";
  boton.textContent = "Enviar";

  const aviso = document.createElement("p");
  aviso.className = "aviso-respuesta";
  aviso.setAttribute("aria-live", "polite");

  form.appendChild(nombreInput);
  form.appendChild(textoInput);
  form.appendChild(boton);
  form.appendChild(aviso);

  form.addEventListener("submit", function (evento) {
    evento.preventDefault();
    aviso.textContent = "";

    const nombre = nombreInput.value.trim();
    const texto = textoInput.value.trim();

    if (!nombre) {
      aviso.textContent = "El nombre es obligatorio.";
      nombreInput.focus();
      return;
    }

    if (!texto) {
      aviso.textContent = "La respuesta es obligatoria.";
      textoInput.focus();
      return;
    }

    if (nombre.length > LIMITE_NOMBRE_RESPUESTA) {
      aviso.textContent =
        `El nombre no puede superar los ${LIMITE_NOMBRE_RESPUESTA} caracteres.`;
      nombreInput.focus();
      return;
    }

    if (texto.length > LIMITE_TEXTO_RESPUESTA) {
      aviso.textContent =
        `La respuesta no puede superar los ${LIMITE_TEXTO_RESPUESTA} caracteres.`;
      textoInput.focus();
      return;
    }

    const resultado = addReply(postId, elementoPadreId, {
      nombre,
      texto,
    });

    if (!resultado.ok) {
      aviso.textContent = resultado.mensaje;
      return;
    }

    renderPosts();
  });

  return form;
}

function crearComentario(comentario, postId) {
  const hilo = document.createElement("div");
  hilo.className = "hilo-comentario";

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
    ? tiempoRelativo(
        new Date(comentario.fecha)
      )
    : "";

  // Acciones del comentario
  const acciones = document.createElement("div");
  acciones.className = "c-acciones";

  // Botón Responder (H14)
  const formularioRespuesta = crearFormularioRespuesta(
    postId,
    comentario.id
  );

  const botonResponder = crearBotonResponder(
    formularioRespuesta,
    comentario.nombre
  );

  // Botón Editar
  const botonEditar = document.createElement("button");
  botonEditar.type = "button";
  botonEditar.className = "btn-editar-comentario";
  botonEditar.textContent = "Editar";

  botonEditar.addEventListener(
    "click",
    function () {
      iniciarEdicionComentario(
        cuerpo,
        postId,
        comentario
      );
    }
  );

  // Botón Eliminar
  const botonEliminar =
    document.createElement("button");

  botonEliminar.type = "button";
  botonEliminar.className =
    "btn-eliminar-comentario";

  botonEliminar.textContent = "Eliminar";

  botonEliminar.addEventListener(
    "click",
    function () {
      const confirmar = window.confirm(
        "¿Está seguro de que desea eliminar este comentario?"
      );

      if (!confirmar) {
        return;
      }

      deleteComment(
        postId,
        comentario.id
      );

      renderPosts();
    }
  );

  acciones.appendChild(botonResponder);
  acciones.appendChild(botonEditar);
  acciones.appendChild(botonEliminar);

  cuerpo.appendChild(autor);
  cuerpo.appendChild(
    document.createTextNode(" ")
  );
  cuerpo.appendChild(texto);
  cuerpo.appendChild(fecha);
  cuerpo.appendChild(acciones);

  div.appendChild(avatar);
  div.appendChild(cuerpo);

  const respuestas = document.createElement("div");
  respuestas.className = "respuestas";

  (comentario.respuestas || []).forEach((respuesta) => {
    respuestas.appendChild(
      crearRespuesta(respuesta, postId)
    );
  });

  respuestas.appendChild(formularioRespuesta);

  hilo.appendChild(div);
  hilo.appendChild(respuestas);

  return hilo;
}

function iniciarEdicionComentario(
  cuerpo,
  postId,
  comentario
) {
  const autor = document.createElement("span");
  autor.className = "c-autor";
  autor.textContent = comentario.nombre;

  const textarea =
    document.createElement("textarea");

  textarea.className =
    "edit-comentario-input";

  textarea.value = comentario.texto;
  textarea.maxLength = 200;

  const fecha = document.createElement("span");
  fecha.className = "c-fecha";

  fecha.textContent = comentario.fecha
    ? tiempoRelativo(
        new Date(comentario.fecha)
      )
    : "";

  const error = document.createElement("p");
  error.className =
    "aviso-edicion-comentario";

  const botones =
    document.createElement("div");

  botones.className =
    "botones-edicion-comentario";

  const botonGuardar =
    document.createElement("button");

  botonGuardar.type = "button";
  botonGuardar.className =
    "btn-guardar-comentario";

  botonGuardar.textContent = "Guardar";

  const botonCancelar =
    document.createElement("button");

  botonCancelar.type = "button";
  botonCancelar.className =
    "btn-cancelar-comentario";

  botonCancelar.textContent = "Cancelar";

  botones.appendChild(botonGuardar);
  botones.appendChild(botonCancelar);

  cuerpo.innerHTML = "";

  cuerpo.appendChild(autor);
  cuerpo.appendChild(textarea);
  cuerpo.appendChild(fecha);
  cuerpo.appendChild(error);
  cuerpo.appendChild(botones);

  botonGuardar.addEventListener(
    "click",
    function () {
      const nuevoTexto =
        textarea.value.trim();

      if (!nuevoTexto) {
        error.textContent =
          "El comentario no puede estar vacío.";

        textarea.focus();
        return;
      }

      if (nuevoTexto.length > 200) {
        error.textContent =
          "El comentario no puede superar los 200 caracteres.";

        textarea.focus();
        return;
      }

      updateComment(
        postId,
        comentario.id,
        nuevoTexto
      );

      renderPosts();
    }
  );

  botonCancelar.addEventListener(
    "click",
    function () {
      renderPosts();
    }
  );

  textarea.focus();
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
      id: generarIdComentario(),
      nombre: nombreTexto,
      texto: comentarioTexto,
      fecha: new Date().toISOString(),
    });

    renderPosts();
  });

  return form;
}

/**
 * Crea el panel que permite elegir el motivo de un reporte (H20).
 * Cancelar cierra el panel sin guardar nada y el botón Confirmar se
 * deshabilita mientras se registra, para que la misma acción no se
 * guarde dos veces.
 *
 * @param {Object} post Publicación que se desea reportar.
 * @returns {HTMLFormElement} Panel listo para insertarse.
 */
function crearPanelReporte(post) {
  const panel = document.createElement("form");
  panel.className = "panel-reporte oculto";
  panel.noValidate = true;

  const titulo = document.createElement("span");
  titulo.className = "panel-reporte-titulo";
  titulo.textContent = "Motivo del reporte:";

  const select = document.createElement("select");
  select.className = "motivo-select";
  select.setAttribute(
    "aria-label",
    `Motivo del reporte para la publicación de ${post.nombre}`
  );

  MOTIVOS.forEach((motivo) => {
    const opcion = document.createElement("option");
    opcion.value = motivo.valor;
    opcion.textContent = motivo.texto;
    select.appendChild(opcion);
  });

  const botonConfirmar = document.createElement("button");
  botonConfirmar.type = "submit";
  botonConfirmar.className = "btn-confirmar-reporte";
  botonConfirmar.textContent = "Confirmar reporte";

  const botonCancelar = document.createElement("button");
  botonCancelar.type = "button";
  botonCancelar.className = "btn-cancelar-reporte";
  botonCancelar.textContent = "Cancelar";

  const aviso = document.createElement("p");
  aviso.className = "aviso-reporte";
  aviso.setAttribute("aria-live", "polite");

  panel.appendChild(titulo);
  panel.appendChild(select);
  panel.appendChild(botonConfirmar);
  panel.appendChild(botonCancelar);
  panel.appendChild(aviso);

  botonCancelar.addEventListener("click", function () {
    // Cancelar antes de confirmar no registra ningún reporte.
    panel.classList.add("oculto");
    aviso.textContent = "";
  });

  panel.addEventListener("submit", function (evento) {
    evento.preventDefault();
    aviso.textContent = "";

    if (botonConfirmar.disabled) {
      return;
    }

    botonConfirmar.disabled = true;

    const resultado = reportPost(post.id, select.value);

    if (!resultado.ok) {
      aviso.textContent = resultado.mensaje;
      botonConfirmar.disabled = false;
      return;
    }

    if (resultado.duplicado) {
      aviso.textContent =
        "Esta publicación ya tiene un reporte con ese motivo.";
      botonConfirmar.disabled = false;
      return;
    }

    renderPosts();
  });

  return panel;
}

/**
 * Crea la fila de una publicación reportada dentro de Moderación (H20).
 * Las acciones utilizan el id de la publicación, nunca su posición.
 *
 * @param {Object} post Publicación con al menos un reporte.
 * @returns {HTMLLIElement} Elemento de la lista de moderación.
 */
function crearItemModeracion(post) {
  const item = document.createElement("li");
  item.className = "item-moderacion";

  const autor = document.createElement("span");
  autor.className = "moderacion-autor";
  autor.textContent = post.nombre || "";

  const mensaje = document.createElement("p");
  mensaje.className = "moderacion-mensaje";
  mensaje.textContent = resumirMensaje(post.mensaje);

  const motivos = document.createElement("div");
  motivos.className = "moderacion-motivos";

  (post.reportes || []).forEach((reporte) => {
    const motivo = document.createElement("span");
    motivo.className = `motivo-reporte motivo-${reporte.motivo}`;
    motivo.textContent = formatearMotivo(reporte.motivo);

    const fecha = formatearFechaHora(reporte.fecha);

    if (fecha) {
      motivo.title = `Reportada el ${fecha}`;
    }

    motivos.appendChild(motivo);
  });

  const acciones = document.createElement("div");
  acciones.className = "moderacion-acciones";

  const botonDescartar = document.createElement("button");
  botonDescartar.type = "button";
  botonDescartar.className = "btn-descartar-reporte";
  botonDescartar.textContent = "Descartar reporte";

  botonDescartar.addEventListener("click", function () {
    const resultado = dismissReports(post.id);

    if (!resultado.ok) {
      window.alert(resultado.mensaje);
      return;
    }

    renderPosts();
  });

  const botonEliminar = document.createElement("button");
  botonEliminar.type = "button";
  botonEliminar.className = "btn-eliminar-reportada";
  botonEliminar.textContent = "Eliminar publicación";

  botonEliminar.addEventListener("click", function () {
    const confirmar = window.confirm(
      `¿Está seguro de que desea eliminar la publicación de ${post.nombre}?`
    );

    if (!confirmar) {
      return;
    }

    deletePost(post.id);

    renderPosts();
  });

  acciones.appendChild(botonDescartar);
  acciones.appendChild(botonEliminar);

  item.appendChild(autor);
  item.appendChild(mensaje);
  item.appendChild(motivos);
  item.appendChild(acciones);

  return item;
}

/**
 * Dibuja la vista Moderación con las publicaciones reportadas (H20).
 * Las publicaciones siguen visibles en el feed; aquí solo se listan
 * para revisarlas.
 */
function renderModeracion() {
  const lista = document.getElementById("lista-moderacion");
  const boton = document.getElementById("ver-moderacion");

  if (!lista) {
    return;
  }

  const reportadas = getPosts().filter(
    (post) => (post.reportes || []).length > 0
  );

  if (boton) {
    boton.textContent = `⚑ Moderación (${reportadas.length})`;
  }

  lista.innerHTML = "";

  if (reportadas.length === 0) {
    const vacio = document.createElement("li");
    vacio.className = "moderacion-vacio";
    vacio.textContent = "No hay publicaciones reportadas.";
    lista.appendChild(vacio);
    return;
  }

  reportadas.forEach((post) => {
    lista.appendChild(crearItemModeracion(post));
  });
}

function crearPublicacion(post) {
  const li = document.createElement("li");
  li.className = post.favorita
    ? "publicacion publicacion-favorita"
    : "publicacion";

  // Nombre
  const nombre = document.createElement("div");
  nombre.className = "nombre";
  nombre.setAttribute(
    "data-inicial",
    (post.nombre || "?").trim().charAt(0).toUpperCase()
  );
  nombre.textContent = post.nombre;

  // Etiqueta (H15)
  const etiqueta = document.createElement("span");
  etiqueta.className = `etiqueta etiqueta-${post.etiqueta}`;
  etiqueta.textContent = formatearEtiqueta(post.etiqueta);
  nombre.appendChild(etiqueta);

  // Aviso de contenido reportado (H20). La publicación sigue visible.
  if ((post.reportes || []).length > 0) {
    const insignia = document.createElement("span");
    insignia.className = "insignia-reportada";
    insignia.textContent = "⚑ Reportada";
    insignia.title = post.reportes
      .map((reporte) => formatearMotivo(reporte.motivo))
      .join(", ");
    nombre.appendChild(insignia);
  }

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

  (post.comentarios || []).forEach(
    (comentario) => {
      contenedorComentarios.appendChild(
        crearComentario(
          comentario,
          post.id
        )
      );
    }
  );

  const formComentario = crearFormularioComentario(post);
  contenedorComentarios.appendChild(formComentario);

  // Contenedor de acciones
  const acciones = document.createElement("div");
  acciones.className = "acciones-publicacion";

  // Contadores por tipo de reacción (H13)
  const contadores = document.createElement("div");
  contadores.className = "contador-reacciones";

  REACCIONES.forEach((reaccion) => {
    const cantidad = obtenerCantidadReaccion(post, reaccion.tipo);

    const contador = document.createElement("span");
    contador.className = "contador-reaccion";
    contador.setAttribute("data-tipo", reaccion.tipo);
    contador.title = `${cantidad} ${reaccion.etiqueta}`;
    contador.textContent = `${reaccion.icono} ${cantidad}`;

    contadores.appendChild(contador);
  });

  // Botones de reacción (H13)
  const botonesReaccion = document.createElement("div");
  botonesReaccion.className = "botones-reaccion";

  REACCIONES.forEach((reaccion) => {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = `btn-reaccion btn-${reaccion.tipo}`;
    boton.setAttribute("data-tipo", reaccion.tipo);
    boton.textContent = `${reaccion.icono} ${reaccion.etiqueta}`;

    boton.setAttribute(
      "aria-label",
      `Reaccionar con ${reaccion.etiqueta} a la publicación de ${post.nombre}`
    );

    boton.addEventListener("click", function () {
      incrementReaction(post.id, reaccion.tipo);
      renderPosts();
    });

    botonesReaccion.appendChild(boton);
  });

  // Contenedor de botones
  const botones = document.createElement("div");
  botones.className = "botones-publicacion";

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

  // Botón Favorito (H16)
  const botonFavorito = document.createElement("button");
  botonFavorito.type = "button";
  botonFavorito.className = post.favorita
    ? "btn-favorito activo"
    : "btn-favorito";
  botonFavorito.textContent = post.favorita
    ? "★ Favorita"
    : "☆ Favorito";
  botonFavorito.setAttribute(
    "aria-pressed",
    String(post.favorita)
  );
  botonFavorito.setAttribute(
    "aria-label",
    post.favorita
      ? `Quitar la publicación de ${post.nombre} de favoritos`
      : `Marcar la publicación de ${post.nombre} como favorita`
  );

  botonFavorito.addEventListener("click", function () {
    const resultado = toggleFavorite(post.id);

    if (!resultado.ok) {
      window.alert(resultado.mensaje);
      return;
    }

    renderPosts();
  });

  // Botón Reportar (H20)
  const panelReporte = crearPanelReporte(post);

  const botonReportar = document.createElement("button");
  botonReportar.type = "button";
  botonReportar.className = "btn-reportar";
  botonReportar.textContent = "⚑ Reportar";
  botonReportar.setAttribute("aria-expanded", "false");
  botonReportar.setAttribute(
    "aria-label",
    `Reportar la publicación de ${post.nombre}`
  );

  botonReportar.addEventListener("click", function () {
    const oculto = panelReporte.classList.toggle("oculto");
    botonReportar.setAttribute("aria-expanded", String(!oculto));

    if (!oculto) {
      panelReporte.querySelector(".motivo-select").focus();
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
  botones.appendChild(botonComentar);
  botones.appendChild(botonFavorito);
  botones.appendChild(botonReportar);
  botones.appendChild(botonEditar);
  botones.appendChild(botonEliminar);

  // Agregar acciones
  acciones.appendChild(contadores);
  acciones.appendChild(botonesReaccion);
  acciones.appendChild(botones);
  acciones.appendChild(panelReporte);

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

  // La paginación (H18) solo recorta lo que se dibuja: el arreglo
  // guardado nunca se divide ni se vuelve a escribir.
  const paginacion = calcularPaginacion(posts.length);

  renderPaginacion(
    paginacion.pagina,
    paginacion.totalPaginas,
    posts.length
  );

  if (posts.length === 0) {
    const li = document.createElement("li");
    li.className = "vacio";

    if (getPosts().length === 0) {
      li.textContent = "Aún no hay publicaciones. ¡Sé el primero en publicar!";
    } else {
      li.textContent = "No se encontraron publicaciones para los criterios seleccionados.";
    }

    lista.appendChild(li);
    actualizarResumen();
    renderModeracion();
    return;
  }

  posts
    .slice(paginacion.inicio, paginacion.fin)
    .forEach((post) => {
      lista.appendChild(crearPublicacion(post));
    });

  actualizarResumen();
  renderModeracion();
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
