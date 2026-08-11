const STORAGE_KEY = "publicaciones";

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
    return JSON.parse(datos);
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
 * Aumenta en uno la cantidad de Me gusta de una publicación.
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