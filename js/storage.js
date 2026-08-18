const STORAGE_KEY = "publicaciones";
const DRAFT_STORAGE_KEY = "borrador-publicacion";

/** Tipos de reacción disponibles (H13). */
const TIPOS_REACCION = ["megusta", "meencanta", "medivierte"];

/** Límites de los datos de una respuesta (H14). */
const LIMITE_NOMBRE_RESPUESTA = 50;
const LIMITE_TEXTO_RESPUESTA = 200;

/** Etiquetas disponibles para las publicaciones (H15). */
const ETIQUETAS = ["general", "estudio", "evento", "ayuda"];

/**
 * Devuelve una etiqueta válida (H15). Las publicaciones antiguas
 * sin etiqueta o con un valor desconocido se tratan como General.
 *
 * @param {*} valor Etiqueta guardada en LocalStorage.
 * @returns {string} Etiqueta válida: general, estudio, evento o ayuda.
 */
function normalizarEtiqueta(valor) {
  return ETIQUETAS.includes(valor) ? valor : "general";
}

/**
 * Convierte cualquier valor en una cantidad válida de reacciones.
 * Los valores ausentes, negativos o no numéricos se tratan como cero.
 *
 * @param {*} valor Valor guardado en LocalStorage.
 * @returns {number} Cantidad de reacciones.
 */
function contarReaccion(valor) {
  const numero = Number(valor);

  if (!Number.isFinite(numero) || numero < 0) {
    return 0;
  }

  return Math.floor(numero);
}

/**
 * Devuelve la estructura de reacciones de una publicación (H13).
 * Las publicaciones antiguas que solo tienen la propiedad likes
 * conservan esa cantidad como Me gusta y las demás inician en cero.
 *
 * @param {Object} post Publicación guardada.
 * @returns {Object} Reacciones con las tres cantidades.
 */
function normalizarReacciones(post) {
  const reacciones = post.reacciones || {};

  return {
    megusta: contarReaccion(
      reacciones.megusta !== undefined ? reacciones.megusta : post.likes
    ),
    meencanta: contarReaccion(reacciones.meencanta),
    medivierte: contarReaccion(reacciones.medivierte),
  };
}

/**
 * Completa una publicación con las propiedades nuevas para que
 * los datos antiguos de LocalStorage sigan funcionando.
 *
 * @param {Object} post Publicación guardada.
 * @returns {Object} Publicación con sus propiedades actuales normalizadas.
 */
function normalizarPost(post) {
  const base = post && typeof post === "object" ? post : {};

  const reacciones = normalizarReacciones(base);

  return {
    ...base,
    etiqueta: normalizarEtiqueta(base.etiqueta),
    favorita: base.favorita === true,
    reacciones,
    likes: reacciones.megusta,
  };
}

/**
 * Genera un identificador único para un comentario.
 *
 * @returns {string} Identificador único.
 */
function generarIdComentario() {
  if (
    window.crypto &&
    typeof window.crypto.randomUUID === "function"
  ) {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

/**
 * Genera un identificador único para una respuesta (H14).
 *
 * @returns {string} Identificador único.
 */
function generarIdRespuesta() {
  if (
    window.crypto &&
    typeof window.crypto.randomUUID === "function"
  ) {
    return window.crypto.randomUUID();
  }

  return `respuesta-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

/**
 * Devuelve un id de respuesta que no esté presente en los datos actuales.
 *
 * @param {Set} idsEnUso Identificadores ya almacenados.
 * @returns {string} Identificador único dentro de la aplicación.
 */
function generarIdRespuestaUnico(idsEnUso) {
  let id = generarIdRespuesta();
  let sufijo = 1;

  while (idsEnUso.has(id)) {
    id = `${generarIdRespuesta()}-${sufijo}`;
    sufijo += 1;
  }

  idsEnUso.add(id);
  return id;
}

/**
 * Normaliza una respuesta y todas sus descendientes (H14).
 * Cada nivel recibe un arreglo de respuestas y un id único, de modo que los
 * datos creados antes de incorporar conversaciones anidadas siguen siendo
 * válidos.
 *
 * @param {*} respuesta Respuesta almacenada.
 * @param {Set} idsEnUso Identificadores encontrados hasta el momento.
 * @returns {{ respuesta: Object, huboCambios: boolean }} Resultado normalizado.
 */
function normalizarRespuesta(respuesta, idsEnUso) {
  const base =
    respuesta && typeof respuesta === "object"
      ? respuesta
      : {};

  const idValido =
    base.id !== undefined &&
    base.id !== null &&
    base.id !== "" &&
    !idsEnUso.has(base.id);

  const id = idValido
    ? base.id
    : generarIdRespuestaUnico(idsEnUso);

  if (idValido) {
    idsEnUso.add(id);
  }

  const respuestasOriginales = Array.isArray(base.respuestas)
    ? base.respuestas
    : [];

  let huboCambios =
    base !== respuesta ||
    !idValido ||
    !Array.isArray(base.respuestas);

  const respuestas = respuestasOriginales.map((respuestaHija) => {
    const resultado = normalizarRespuesta(
      respuestaHija,
      idsEnUso
    );

    if (resultado.huboCambios) {
      huboCambios = true;
    }

    return resultado.respuesta;
  });

  return {
    respuesta: {
      ...base,
      id,
      respuestas,
    },
    huboCambios,
  };
}

/**
 * Registra recursivamente los ids de un árbol de respuestas.
 *
 * @param {Array} respuestas Respuestas del nivel actual.
 * @param {Set} idsEnUso Colección en la que se registran los ids.
 */
function registrarIdsRespuestas(respuestas, idsEnUso) {
  (respuestas || []).forEach((respuesta) => {
    idsEnUso.add(respuesta.id);
    registrarIdsRespuestas(respuesta.respuestas, idsEnUso);
  });
}

/**
 * Agrega una respuesta bajo el elemento indicado dentro de un árbol.
 * Devuelve nuevas referencias solo para la rama modificada.
 *
 * @param {Array} elementos Comentarios o respuestas del nivel actual.
 * @param {string} elementoPadreId Id del comentario o respuesta padre.
 * @param {Object} nuevaRespuesta Respuesta que se desea agregar.
 * @returns {{ elementos: Array, encontrado: boolean }} Árbol actualizado.
 */
function agregarRespuestaEnArbol(
  elementos,
  elementoPadreId,
  nuevaRespuesta
) {
  for (let indice = 0; indice < elementos.length; indice += 1) {
    const elemento = elementos[indice];

    if (elemento.id === elementoPadreId) {
      const actualizados = [...elementos];

      actualizados[indice] = {
        ...elemento,
        respuestas: [
          ...(elemento.respuestas || []),
          nuevaRespuesta,
        ],
      };

      return {
        elementos: actualizados,
        encontrado: true,
      };
    }

    const resultadoHijos = agregarRespuestaEnArbol(
      elemento.respuestas || [],
      elementoPadreId,
      nuevaRespuesta
    );

    if (resultadoHijos.encontrado) {
      const actualizados = [...elementos];

      actualizados[indice] = {
        ...elemento,
        respuestas: resultadoHijos.elementos,
      };

      return {
        elementos: actualizados,
        encontrado: true,
      };
    }
  }

  return {
    elementos,
    encontrado: false,
  };
}

/**
 * Obtiene las publicaciones guardadas en LocalStorage.
 *
 * También asigna un id a comentarios antiguos que todavía
 * no tengan uno.
 *
 * @returns {Array} Lista de publicaciones.
 */
function getPosts() {
  let posts;

  try {
    const datos = localStorage.getItem(STORAGE_KEY);

    if (!datos) {
      return [];
    }

    posts = JSON.parse(datos);
  } catch (error) {
    console.error(
      "No fue posible leer las publicaciones:",
      error
    );

    return [];
  }

  if (!Array.isArray(posts)) {
    return [];
  }

  let huboCambios = false;
  // Los ids de comentarios también se reservan porque la búsqueda del padre
  // recorre comentarios y respuestas dentro del mismo árbol.
  const idsElementos = new Set();

  posts.forEach((post) => {
    if (!Array.isArray(post?.comentarios)) {
      return;
    }

    post.comentarios.forEach((comentario) => {
      if (
        comentario &&
        comentario.id !== undefined &&
        comentario.id !== null &&
        comentario.id !== ""
      ) {
        idsElementos.add(comentario.id);
      }
    });
  });

  const postsNormalizados = posts.map((post) => {
    // Completa las reacciones de la publicación (H13).
    const normalizado = normalizarPost(post);

    // Completa la etiqueta de las publicaciones antiguas (H15).
    if (normalizado.etiqueta !== post?.etiqueta) {
      huboCambios = true;
    }

    // Las publicaciones anteriores a H16 se consideran no favoritas.
    if (normalizado.favorita !== post?.favorita) {
      huboCambios = true;
    }

    if (!Array.isArray(normalizado.comentarios)) {
      return normalizado;
    }

    let cambioPost = false;

    const comentariosActualizados = normalizado.comentarios.map(
      (comentario) => {
        const baseComentario =
          comentario && typeof comentario === "object"
            ? comentario
            : {};

        const tieneId =
          baseComentario.id !== undefined &&
          baseComentario.id !== null &&
          baseComentario.id !== "";

        const respuestasOriginales = Array.isArray(
          baseComentario.respuestas
        )
          ? baseComentario.respuestas
          : [];

        if (!tieneId || !Array.isArray(baseComentario.respuestas)) {
          huboCambios = true;
          cambioPost = true;
        }

        const respuestas = respuestasOriginales.map((respuesta) => {
          const resultado = normalizarRespuesta(
            respuesta,
            idsElementos
          );

          if (resultado.huboCambios) {
            huboCambios = true;
            cambioPost = true;
          }

          return resultado.respuesta;
        });

        return {
          ...baseComentario,
          id: tieneId
            ? baseComentario.id
            : generarIdComentario(),
          respuestas,
        };
      }
    );

    if (!cambioPost) {
      return normalizado;
    }

    return {
      ...normalizado,
      comentarios: comentariosActualizados,
    };
  });

  if (huboCambios) {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(postsNormalizados)
      );
    } catch (error) {
      // La aplicación puede seguir mostrando los datos normalizados aunque
      // el navegador no permita persistir la migración en este momento.
      console.error(
        "No fue posible actualizar los datos antiguos:",
        error
      );
    }
  }

  return postsNormalizados;
}

/**
 * Guarda todas las publicaciones en LocalStorage.
 *
 * @param {Array} posts Lista completa de publicaciones.
 */
function savePosts(posts) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(posts)
  );
}

/**
 * Agrega una nueva publicación.
 *
 * @param {Object} post Publicación que se desea guardar.
 */
function savePost(post) {
  const posts = getPosts();

  posts.push(post);

  savePosts(posts);
}

/**
 * Aumenta en uno una reacción de la publicación indicada (H13).
 * Solo cambia el contador del tipo recibido y no afecta a las
 * demás publicaciones ni a las otras reacciones.
 *
 * @param {number} postId Identificador de la publicación.
 * @param {string} tipo Tipo de reacción: megusta, meencanta o medivierte.
 */
function incrementReaction(postId, tipo) {
  if (!TIPOS_REACCION.includes(tipo)) {
    return;
  }

  const posts = getPosts();

  const postsActualizados = posts.map((post) => {
    if (post.id === postId) {
      const reacciones = {
        ...post.reacciones,
        [tipo]: contarReaccion(post.reacciones[tipo]) + 1,
      };

      return {
        ...post,
        reacciones,
        likes: reacciones.megusta,
      };
    }

    return post;
  });

  savePosts(postsActualizados);
}

/**
 * Aumenta en uno la cantidad de Me gusta de una publicación.
 *
 * @param {number} postId Identificador de la publicación.
 */
function incrementLike(postId) {
  incrementReaction(postId, "megusta");
}

/**
 * Actualiza el mensaje de una publicación existente sin alterar
 * el nombre, la fecha original ni las reacciones.
 *
 * @param {number} postId Identificador de la publicación.
 * @param {string} mensaje Nuevo mensaje.
 */
function updatePost(postId, mensaje) {
  const posts = getPosts();

  const postsActualizados = posts.map((post) => {
    if (post.id === postId) {
      return {
        ...post,
        mensaje,
      };
    }

    return post;
  });

  savePosts(postsActualizados);
}

/** Guarda únicamente los campos recuperables del compositor (H17). */
function saveDraft(nombre, mensaje) {
  const borrador = {
    nombre: typeof nombre === "string" ? nombre : "",
    mensaje: typeof mensaje === "string" ? mensaje : "",
  };

  try {
    if (!borrador.nombre && !borrador.mensaje) {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } else {
      localStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify(borrador)
      );
    }

    return true;
  } catch (error) {
    console.error("No fue posible guardar el borrador:", error);
    return false;
  }
}

/** Recupera un borrador válido sin afectar las publicaciones guardadas. */
function getDraft() {
  try {
    const datos = localStorage.getItem(DRAFT_STORAGE_KEY);

    if (!datos) {
      return null;
    }

    const borrador = JSON.parse(datos);

    if (
      !borrador ||
      typeof borrador !== "object" ||
      Array.isArray(borrador)
    ) {
      throw new Error("El borrador guardado no es válido.");
    }

    return {
      nombre:
        typeof borrador.nombre === "string"
          ? borrador.nombre
          : "",
      mensaje:
        typeof borrador.mensaje === "string"
          ? borrador.mensaje
          : "",
    };
  } catch (error) {
    console.error("No fue posible recuperar el borrador:", error);

    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (removeError) {
      console.error(
        "No fue posible descartar el borrador inválido:",
        removeError
      );
    }

    return null;
  }
}

/** Elimina el borrador del compositor (H17). */
function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error("No fue posible descartar el borrador:", error);
    return false;
  }
}

/**
 * Alterna el estado favorito de una publicación (H16).
 *
 * @param {number} postId Identificador de la publicación.
 * @returns {{ ok: boolean, favorita?: boolean, mensaje?: string }} Resultado.
 */
function toggleFavorite(postId) {
  const posts = getPosts();
  let encontrada = false;
  let favorita = false;

  const postsActualizados = posts.map((post) => {
    if (post.id !== postId) {
      return post;
    }

    encontrada = true;
    favorita = !post.favorita;

    return {
      ...post,
      favorita,
    };
  });

  if (!encontrada) {
    return {
      ok: false,
      mensaje: "La publicación seleccionada ya no existe.",
    };
  }

  try {
    savePosts(postsActualizados);
  } catch (error) {
    console.error(
      "No fue posible actualizar la publicación favorita:",
      error
    );

    return {
      ok: false,
      mensaje:
        "No fue posible actualizar Favoritos. Inténtalo nuevamente.",
    };
  }

  return {
    ok: true,
    favorita,
  };
}

/**
 * Agrega un comentario a una publicación.
 *
 * @param {number} postId Identificador de la publicación.
 * @param {Object} comentario Comentario a guardar.
 */
function addComment(postId, comentario) {
  const posts = getPosts();

  const comentarioConId = {
    ...comentario,
    id:
      comentario.id ??
      generarIdComentario(),
    respuestas: Array.isArray(comentario.respuestas)
      ? comentario.respuestas
      : [],
  };

  const postsActualizados = posts.map((post) => {
    if (post.id === postId) {
      return {
        ...post,
        comentarios: [
          ...(post.comentarios || []),
          comentarioConId,
        ],
      };
    }

    return post;
  });

  savePosts(postsActualizados);
}

/**
 * Agrega una respuesta al comentario o respuesta indicados (H14).
 * La publicación y el elemento padre se localizan por sus identificadores,
 * nunca por su posición visual ni por el contenido de sus textos.
 *
 * @param {number} postId Identificador de la publicación.
 * @param {string} elementoPadreId Id del comentario o respuesta padre.
 * @param {Object} respuesta Datos introducidos por el usuario.
 * @returns {Object} Resultado de la operación: { ok, mensaje?, respuesta? }.
 */
function addReply(postId, elementoPadreId, respuesta) {
  const nombre = String(respuesta?.nombre || "").trim();
  const texto = String(respuesta?.texto || "").trim();

  if (!nombre || !texto) {
    return {
      ok: false,
      mensaje: "El nombre y la respuesta son obligatorios.",
    };
  }

  if (nombre.length > LIMITE_NOMBRE_RESPUESTA) {
    return {
      ok: false,
      mensaje: `El nombre no puede superar los ${LIMITE_NOMBRE_RESPUESTA} caracteres.`,
    };
  }

  if (texto.length > LIMITE_TEXTO_RESPUESTA) {
    return {
      ok: false,
      mensaje: `La respuesta no puede superar los ${LIMITE_TEXTO_RESPUESTA} caracteres.`,
    };
  }

  const posts = getPosts();
  const idsElementos = new Set();

  posts.forEach((post) => {
    (post.comentarios || []).forEach((comentario) => {
      idsElementos.add(comentario.id);
      registrarIdsRespuestas(
        comentario.respuestas,
        idsElementos
      );
    });
  });

  const respuestaConId = {
    id: generarIdRespuestaUnico(idsElementos),
    nombre,
    texto,
    fecha: new Date().toISOString(),
    respuestas: [],
  };

  let publicacionEncontrada = false;
  let elementoPadreEncontrado = false;

  const postsActualizados = posts.map((post) => {
    if (post.id !== postId) {
      return post;
    }

    publicacionEncontrada = true;

    const resultado = agregarRespuestaEnArbol(
      post.comentarios || [],
      elementoPadreId,
      respuestaConId
    );

    elementoPadreEncontrado = resultado.encontrado;

    return {
      ...post,
      comentarios: resultado.elementos,
    };
  });

  if (!publicacionEncontrada) {
    return {
      ok: false,
      mensaje: "La publicación seleccionada ya no existe.",
    };
  }

  if (!elementoPadreEncontrado) {
    return {
      ok: false,
      mensaje:
        "El comentario o la respuesta seleccionada ya no existe.",
    };
  }

  try {
    savePosts(postsActualizados);
  } catch (error) {
    console.error("No fue posible guardar la respuesta:", error);

    return {
      ok: false,
      mensaje:
        "No fue posible guardar la respuesta. Inténtalo nuevamente.",
    };
  }

  return {
    ok: true,
    respuesta: respuestaConId,
  };
}

/**
 * Edita únicamente el texto de un comentario.
 * Conserva autor y fecha original.
 *
 * @param {number} postId Id de la publicación.
 * @param {string} comentarioId Id del comentario.
 * @param {string} nuevoTexto Nuevo texto.
 */
function updateComment(
  postId,
  comentarioId,
  nuevoTexto
) {
  const posts = getPosts();

  const postsActualizados = posts.map((post) => {
    // Primero localizamos la publicación.
    if (post.id !== postId) {
      return post;
    }

    const comentariosActualizados = (
      post.comentarios || []
    ).map((comentario) => {
      // Luego localizamos el comentario por su id.
      if (comentario.id !== comentarioId) {
        return comentario;
      }

      return {
        ...comentario,
        texto: nuevoTexto,
      };
    });

    return {
      ...post,
      comentarios: comentariosActualizados,
    };
  });

  savePosts(postsActualizados);
}

/**
 * Elimina un comentario utilizando el id de la publicación
 * y el id del comentario.
 *
 * @param {number} postId Id de la publicación.
 * @param {string} comentarioId Id del comentario.
 */
function deleteComment(postId, comentarioId) {
  const posts = getPosts();

  const postsActualizados = posts.map((post) => {
    // Primero localizamos la publicación.
    if (post.id !== postId) {
      return post;
    }

    // Después eliminamos únicamente el comentario
    // cuyo id coincida.
    const comentariosActualizados = (
      post.comentarios || []
    ).filter((comentario) => {
      return comentario.id !== comentarioId;
    });

    return {
      ...post,
      comentarios: comentariosActualizados,
    };
  });

  savePosts(postsActualizados);
}

/**
 * Elimina una publicación utilizando su id.
 *
 * @param {number} postId Identificador de la publicación.
 */
function deletePost(postId) {
  const posts = getPosts();

  const postsActualizados = posts.filter(
    (post) => {
      return post.id !== postId;
    }
  );

  savePosts(postsActualizados);
}
