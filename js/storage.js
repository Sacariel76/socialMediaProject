const STORAGE_KEY = "publicaciones";

/** Tipos de reacción disponibles (H13). */
const TIPOS_REACCION = ["megusta", "meencanta", "medivierte"];

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
 * @returns {Object} Publicación con reacciones y likes consistentes.
 */
function normalizarPost(post) {
  const base = post && typeof post === "object" ? post : {};

  const reacciones = normalizarReacciones(base);

  return {
    ...base,
    reacciones,
    likes: reacciones.megusta,
  };
}

/**
 * Obtiene las publicaciones guardadas en LocalStorage.
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

    return posts.map(normalizarPost);
  } catch (error) {
    console.error("No fue posible leer las publicaciones:", error);
    return [];
  }
}

/**
 * Guarda todas las publicaciones en LocalStorage.
 *
 * @param {Array} posts Lista completa de publicaciones.
 */
function savePosts(posts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
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
 * el nombre, la fecha original ni la cantidad de Me gusta.
 *
 * @param {number} postId Identificador de la publicación.
 * @param {string} mensaje Nuevo mensaje de la publicación.
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
 * Agrega un comentario a una publicación existente.
 * Las publicaciones antiguas sin la propiedad comentarios
 * se tratan como si tuvieran un arreglo vacío.
 *
 * @param {number} postId Identificador de la publicación.
 * @param {Object} comentario Comentario que se desea guardar.
 */
function addComment(postId, comentario) {
  const posts = getPosts();

  const postsActualizados = posts.map((post) => {
    if (post.id === postId) {
      return {
        ...post,
        comentarios: [...(post.comentarios || []), comentario],
      };
    }

    return post;
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

  const postsActualizados = posts.filter((post) => {
    return post.id !== postId;
  });

  savePosts(postsActualizados);
}