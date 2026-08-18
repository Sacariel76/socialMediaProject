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

  // Paginación (H18)
  const botonPaginaAnterior = document.getElementById("pagina-anterior");
  const botonPaginaSiguiente = document.getElementById("pagina-siguiente");

  // Respaldo (H19)
  const botonExportar = document.getElementById("exportar-respaldo");
  const botonImportar = document.getElementById("importar-respaldo");
  const archivoRespaldo = document.getElementById("archivo-respaldo");
  const avisoRespaldo = document.getElementById("aviso-respaldo");

  // Moderación (H20)
  const botonModeracion = document.getElementById("ver-moderacion");
  const seccionModeracion = document.getElementById("moderacion");

  const CLAVE_FILTRO_ETIQUETA = "filtro-etiqueta";
  const FILTROS_VALIDOS = ["todas", "general", "estudio", "evento", "ayuda"];

  buscar.addEventListener("input", function () {
    estadoFeed.busqueda = buscar.value.trim();
    // Cambiar los criterios recalcula las páginas desde la primera (H18).
    estadoFeed.pagina = 1;
    renderPosts();
  });

  selectorOrden.addEventListener("change", function () {
    estadoFeed.orden = selectorOrden.value;
    estadoFeed.pagina = 1;
    renderPosts();
  });

  botonFiltroFavoritas.addEventListener("click", function () {
    estadoFeed.soloFavoritas = !estadoFeed.soloFavoritas;
    estadoFeed.pagina = 1;

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
      estadoFeed.pagina = 1;

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

  botonPaginaAnterior.addEventListener("click", function () {
    // renderPosts ajusta la página si el valor queda fuera de rango.
    estadoFeed.pagina -= 1;
    renderPosts();
  });

  botonPaginaSiguiente.addEventListener("click", function () {
    estadoFeed.pagina += 1;
    renderPosts();
  });

  /**
   * Muestra el resultado de exportar o importar (H19).
   *
   * @param {string} texto Mensaje para la persona usuaria.
   * @param {string} tipo "ok", "error" o cadena vacía para un aviso neutro.
   */
  function mostrarAvisoRespaldo(texto, tipo) {
    avisoRespaldo.textContent = texto;
    avisoRespaldo.classList.toggle("ok", tipo === "ok");
    avisoRespaldo.classList.toggle("error", tipo === "error");
  }

  botonExportar.addEventListener("click", function () {
    let url = "";

    try {
      const contenido = JSON.stringify(construirRespaldo(), null, 2);
      const blob = new Blob([contenido], { type: "application/json" });
      const fecha = new Date().toISOString().slice(0, 10);

      url = URL.createObjectURL(blob);

      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = `respaldo-red-social-${fecha}.json`;

      document.body.appendChild(enlace);
      enlace.click();
      document.body.removeChild(enlace);

      mostrarAvisoRespaldo("Respaldo descargado correctamente.", "ok");
    } catch (error) {
      console.error("No fue posible exportar el respaldo:", error);
      mostrarAvisoRespaldo(
        "No fue posible exportar el respaldo. Inténtalo nuevamente.",
        "error"
      );
    } finally {
      if (url) {
        // Se libera cuando el navegador ya inició la descarga.
        window.setTimeout(function () {
          URL.revokeObjectURL(url);
        }, 1000);
      }
    }
  });

  botonImportar.addEventListener("click", function () {
    archivoRespaldo.click();
  });

  archivoRespaldo.addEventListener("change", function () {
    const archivo = archivoRespaldo.files && archivoRespaldo.files[0];

    if (!archivo) {
      return;
    }

    const lector = new FileReader();

    // Permite volver a elegir el mismo archivo después de cada intento.
    function terminar(texto, tipo) {
      mostrarAvisoRespaldo(texto, tipo);
      archivoRespaldo.value = "";
    }

    lector.onerror = function () {
      terminar(
        "No fue posible leer el archivo seleccionado. Los datos actuales se conservan.",
        "error"
      );
    };

    lector.onload = function () {
      let datos;

      try {
        datos = JSON.parse(lector.result);
      } catch (error) {
        terminar(
          "El archivo no contiene un JSON válido. Los datos actuales se conservan.",
          "error"
        );
        return;
      }

      // La validación termina antes de escribir en LocalStorage y el
      // contenido del archivo nunca se ejecuta.
      const validacion = validarRespaldo(datos);

      if (!validacion.ok) {
        terminar(
          `${validacion.mensaje} Los datos actuales se conservan.`,
          "error"
        );
        return;
      }

      const actuales = getPosts().length;

      const confirmar = window.confirm(
        `Se reemplazarán las ${actuales} publicaciones actuales por las ${validacion.publicaciones.length} del archivo. ¿Desea continuar?`
      );

      if (!confirmar) {
        terminar("Importación cancelada. No se modificó ningún dato.", "");
        return;
      }

      const resultado = importarRespaldo(validacion.publicaciones);

      if (!resultado.ok) {
        terminar(resultado.mensaje, "error");
        return;
      }

      estadoFeed.pagina = 1;
      renderPosts();

      terminar(
        `Respaldo importado: ${resultado.total} publicaciones restauradas.`,
        "ok"
      );
    };

    lector.readAsText(archivo);
  });

  botonModeracion.addEventListener("click", function () {
    const oculto = seccionModeracion.classList.toggle("oculto");
    botonModeracion.setAttribute("aria-expanded", String(!oculto));
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
    // La publicación nueva se ve en la primera página (H18).
    estadoFeed.pagina = 1;
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
