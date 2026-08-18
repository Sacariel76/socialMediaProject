document.addEventListener("DOMContentLoaded", function () {
  const formulario = document.getElementById("formulario-publicacion");
  const nombre = document.getElementById("nombre");
  const mensaje = document.getElementById("mensaje");
  const aviso = document.getElementById("aviso");
  const contadorCaracteres = document.getElementById("contador-caracteres");

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

  const buscar = document.getElementById("buscar");
  const selectorOrden = document.getElementById("orden-publicaciones");
  const selectorEtiqueta = document.getElementById("etiqueta-publicacion");
  const botonesFiltro = document.querySelectorAll(".filtro-etiqueta");

  buscar.addEventListener("input", function () {
    estadoFeed.busqueda = buscar.value.trim();
    renderPosts();
  });

  selectorOrden.addEventListener("change", function () {
    estadoFeed.orden = selectorOrden.value;
    renderPosts();
  });

  botonesFiltro.forEach(function (boton) {
    boton.addEventListener("click", function () {
      estadoFeed.etiqueta = boton.dataset.etiqueta;

      botonesFiltro.forEach(function (otro) {
        otro.classList.toggle("activo", otro === boton);
      });

      renderPosts();
    });
  });

  mensaje.addEventListener("input", actualizarContadorCaracteres);

  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();

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
      likes: 0,
      reacciones: {
        megusta: 0,
        meencanta: 0,
        medivierte: 0,
      },
      fecha: new Date().toISOString(),
    };

    savePost(post);

    formulario.reset();
    aviso.textContent = "";
    actualizarContadorCaracteres();

    renderPosts();
    nombre.focus();
  });

  actualizarContadorCaracteres();
  renderPosts();
});