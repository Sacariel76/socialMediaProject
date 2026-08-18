document.addEventListener("DOMContentLoaded", function () {
  const formulario = document.getElementById("formulario-publicacion");
  const nombre = document.getElementById("nombre");
  const mensaje = document.getElementById("mensaje");
  const aviso = document.getElementById("aviso");
  const contadorCaracteres = document.getElementById("contador-caracteres");
  const botonDescartarBorrador = document.getElementById(
    "descartar-borrador"
  );

  function actualizarContadorCaracteres() {
    const restantes = LIMITE_MENSAJE - mensaje.value.length;

    contadorCaracteres.textContent =
      restantes === 1
        ? "Queda 1 carácter"
        : `Quedan ${restantes} caracteres`;

    contadorCaracteres.classList.toggle(
      "limite",
      restantes <= 0
    );
  }

  function actualizarBotonDescartar() {
    botonDescartarBorrador.disabled =
      !nombre.value && !mensaje.value;
  }

  function guardarBorradorActual() {
    const guardado = saveDraft(nombre.value, mensaje.value);

    actualizarBotonDescartar();

    if (!guardado) {
      aviso.textContent =
        "No fue posible guardar el borrador automáticamente.";
    }
  }

  const buscar = document.getElementById("buscar");
  const selectorOrden = document.getElementById("orden-publicaciones");
  const selectorEtiqueta = document.getElementById("etiqueta-publicacion");
  const botonesFiltro = document.querySelectorAll(".filtro-etiqueta");
  const botonFiltroFavoritas = document.getElementById("filtro-favoritas");

  const CLAVE_FILTRO_ETIQUETA = "filtro-etiqueta";
  const FILTROS_VALIDOS = ["todas", "general", "estudio", "evento", "ayuda"];

  buscar.addEventListener("input", function () {
    estadoFeed.busqueda = buscar.value.trim();
    renderPosts();
  });

  selectorOrden.addEventListener("change", function () {
    estadoFeed.orden = selectorOrden.value;
    renderPosts();
  });

  botonFiltroFavoritas.addEventListener("click", function () {
    estadoFeed.soloFavoritas = !estadoFeed.soloFavoritas;

    botonFiltroFavoritas.classList.toggle(
      "activo",
      estadoFeed.soloFavoritas
    );
    botonFiltroFavoritas.setAttribute(
      "aria-pressed",
      String(estadoFeed.soloFavoritas)
    );

    renderPosts();
  });

  botonesFiltro.forEach(function (boton) {
    boton.addEventListener("click", function () {
      estadoFeed.etiqueta = boton.dataset.etiqueta;

      botonesFiltro.forEach(function (otro) {
        otro.classList.toggle("activo", otro === boton);
      });

      try {
        localStorage.setItem(
          CLAVE_FILTRO_ETIQUETA,
          estadoFeed.etiqueta
        );
      } catch (error) {
        // El filtro sigue funcionando aunque no se pueda persistir.
      }

      renderPosts();
    });
  });

  // Restaura el filtro seleccionado al recargar (H15).
  let filtroGuardado = null;

  try {
    filtroGuardado = localStorage.getItem(
      CLAVE_FILTRO_ETIQUETA
    );
  } catch (error) {
    // Sin filtro guardado se usa Todas.
  }

  const filtroInicial = FILTROS_VALIDOS.includes(filtroGuardado)
    ? filtroGuardado
    : "todas";

  estadoFeed.etiqueta = filtroInicial;

  botonesFiltro.forEach(function (boton) {
    boton.classList.toggle(
      "activo",
      boton.dataset.etiqueta === filtroInicial
    );
  });

  const borrador = getDraft();

  if (borrador) {
    nombre.value = borrador.nombre;
    mensaje.value = borrador.mensaje;
  }

  nombre.addEventListener("input", guardarBorradorActual);
  mensaje.addEventListener("input", function () {
    actualizarContadorCaracteres();
    guardarBorradorActual();
  });

  botonDescartarBorrador.addEventListener("click", function () {
    if (!clearDraft()) {
      aviso.textContent =
        "No fue posible descartar el borrador. Inténtalo nuevamente.";
      return;
    }

    nombre.value = "";
    mensaje.value = "";
    aviso.textContent = "";
    actualizarContadorCaracteres();
    actualizarBotonDescartar();
    mensaje.focus();
  });

  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();

    // Garantiza que una validación fallida conserve los valores actuales.
    guardarBorradorActual();

    const nombreTexto = nombre.value.trim();
    const mensajeTexto = mensaje.value.trim();

    if (!nombreTexto) {
      aviso.textContent = "El nombre es obligatorio.";
      nombre.focus();
      return;
    }

    if (!/^[A-Za-z\u00C0-\u00FF\s]+$/.test(nombreTexto)) {
      aviso.textContent = "El nombre solo puede contener letras.";
      nombre.focus();
      return;
    }

    if (!mensajeTexto) {
      aviso.textContent = "El mensaje es obligatorio.";
      mensaje.focus();
      return;
    }

    if (mensajeTexto.length > LIMITE_MENSAJE) {
      aviso.textContent =
        `El mensaje no puede superar los ${LIMITE_MENSAJE} caracteres.`;
      mensaje.focus();
      return;
    }

    const post = {
      id: Date.now(),
      nombre: nombreTexto,
      mensaje: mensajeTexto,
      etiqueta: selectorEtiqueta.value,
      favorita: false,
      likes: 0,
      reacciones: {
        megusta: 0,
        meencanta: 0,
        medivierte: 0,
      },
      fecha: new Date().toISOString(),
    };

    try {
      savePost(post);
    } catch (error) {
      console.error("No fue posible publicar:", error);
      aviso.textContent =
        "No fue posible publicar. El borrador se conserva.";
      return;
    }

    formulario.reset();
    const borradorEliminado = clearDraft();

    aviso.textContent = borradorEliminado
      ? ""
      : "La publicación se creó, pero no fue posible limpiar el borrador.";
    actualizarContadorCaracteres();
    actualizarBotonDescartar();

    renderPosts();
    nombre.focus();
  });

  actualizarContadorCaracteres();
  actualizarBotonDescartar();
  renderPosts();
});
