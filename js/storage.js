const STORAGE_KEY = "publicaciones";

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
 * Obtiene las publicaciones guardadas en LocalStorage.
 *
 * También asigna un id a comentarios antiguos que todavía
 * no tengan uno.
 *
 * @returns {Array} Lista de publicaciones.
 */
function getPosts() {
  const datos = localStorage.getItem(STORAGE_KEY);

  if (!datos) {
    return [];
  }

  try {
    const posts = JSON.parse(datos);

    if (!Array.isArray(posts)) {
      return [];
    }

    let huboCambios = false;

    const postsNormalizados = posts.map((post) => {
      if (!Array.isArray(post.comentarios)) {
        return post;
      }

      let cambioPost = false;

      const comentariosActualizados = post.comentarios.map(
        (comentario) => {
          if (
            comentario.id !== undefined &&
            comentario.id !== null &&
            comentario.id !== ""
          ) {
            return comentario;
          }

          huboCambios = true;
          cambioPost = true;

          return {
            ...comentario,
            id: generarIdComentario(),
          };
        }
      );

      if (!cambioPost) {
        return post;
      }

      return {
        ...post,
        comentarios: comentariosActualizados,
      };
    });

    if (huboCambios) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(postsNormalizados)
      );
    }

    return postsNormalizados;
  } catch (error) {
    console.error(
      "No fue posible leer las publicaciones:",
      error
    );

    return [];
  }
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
 * Aumenta en uno la cantidad de Me gusta.
 *
 * @param {number} postId Identificador de la publicación.
 */
function incrementLike(postId) {
  const posts = getPosts();

  const postsActualizados = posts.map((post) => {
    if (post.id === postId) {
      return {
        ...post,
        likes: Number(post.likes || 0) + 1,
      };
    }

    return post;
  });

  savePosts(postsActualizados);
}

/**
 * Actualiza el mensaje de una publicación.
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