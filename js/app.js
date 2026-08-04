document.addEventListener("DOMContentLoaded", function () {
  const formulario = document.getElementById("formulario-publicacion");
  const nombre = document.getElementById("nombre");
  const mensaje = document.getElementById("mensaje");
  const aviso = document.getElementById("aviso");

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

    if (mensajeTexto.length > 200) {
      aviso.textContent =
        "El mensaje no puede superar los 200 caracteres.";
      mensaje.focus();
      return;
    }

    const post = {
      id: Date.now(),
      nombre: nombreTexto,
      mensaje: mensajeTexto,
      likes: 0,
      fecha: new Date().toISOString(),
    };

    savePost(post);

    formulario.reset();
    aviso.textContent = "";

    renderPosts();
    nombre.focus();
  });

  renderPosts();
});