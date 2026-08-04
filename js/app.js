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

    if (!mensajeTexto) {
      aviso.textContent = "El mensaje es obligatorio.";
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
    nombre.value = "";
    mensaje.value = "";
    aviso.textContent = "";
    renderPosts();
  });

  renderPosts();
});
