# ITERACIÓN DE CONTINUIDAD
## Mini red social estudiantil

Backlog nuevo para continuar construyendo con XP

**Misión:** El producto base ya funciona. En esta sesión el equipo debe ampliarlo mediante entregas pequeñas, pruebas continuas, programación en parejas y refactorización. No se espera completar todo el backlog.

**Grupo 3.**
- Luis Alejandro López Reyez
- Sergio Quesada Chavarría.
- Alex Herrera Manzanares.
- Sebastian Rodriguez Mesen.
- Sámiel Marín Cambronero.

## 1. Resultado de la sesión
Al finalizar, cada equipo debe demostrar una versión estable con al menos 8 puntos nuevos aceptados. Puede asumir más trabajo únicamente cuando la versión anterior esté probada y guardada.
- Conservar todas las funciones existentes: publicar, listar, validar, fecha/hora, Me gusta y LocalStorage.
- Completar historias enteras; una historia a medias no suma puntos.
- Mantener un tablero con Pendiente, En desarrollo, En prueba y Terminado.
- Rotar al conductor y navegador cada 25 minutos.
- Registrar pruebas y errores antes de solicitar revisión.

## 2. Reglas XP de trabajo

| Regla | Evidencia esperada |
| --- | --- |
| Una historia a la vez | Solo una historia en En desarrollo por pareja. |
| Integración frecuente | Guardar una versión funcional después de cada historia aceptada. |
| Pruebas continuas | El tester ejecuta pruebas nuevas y de regresión. |
| Diseño simple | Implementar lo necesario para cumplir criterios, sin agregar alcance oculto. |
| Propiedad colectiva | Cualquier integrante puede explicar y mejorar el código. |
| Ritmo sostenible | Si una historia se bloquea por 10 minutos, pedir apoyo al equipo y simplificar. |

## 3. Secuencia autónoma de 180 minutos

| Tiempo | Acción del equipo | Producto de control |
| --- | --- | --- |
| 0-15 | Revisar que la versión base funciona. Asignar roles y abrir el tablero. | Pruebas base aprobadas. |
| 15-30 | Leer el backlog, estimar y seleccionar historias hasta alcanzar 8-12 puntos. | Plan de iteración. |
| 30-70 | Iteración 1. Programar en pareja, probar e integrar. | Primera historia aceptada o devuelta. |
| 70-80 | Revisión interna y rotación de roles. | Tablero y registro actualizados. |
| 80-120 | Iteración 2. Continuar con la siguiente historia priorizada. | Segundo incremento funcional. |
| 120-130 | Pruebas de regresión y pausa técnica. | Lista de errores. |
| 130-160 | Iteración 3 y cambio del cliente. | Versión candidata. |
| 160-172 | Prueba final, limpieza del código y preparación de demo. | Versión estable. |
| 172-180 | Demostración breve y retrospectiva. | Evidencias entregadas. |

## 4. Backlog de continuación
Cómo elegir: Empiecen por H5. Después seleccionen historias según el valor para el usuario y la capacidad real del equipo. H11 se entrega durante la sesión como cambio obligatorio.

### H5. Eliminar una publicación (2 puntos)
Como estudiante, quiero eliminar una publicación para retirar contenido que ya no deseo mostrar.

Criterios de aceptación
- Cada publicación muestra una acción Eliminar.
- La aplicación solicita confirmación antes de borrar.
- Al confirmar, desaparece únicamente la publicación seleccionada.
- El cambio permanece después de recargar.

Pruebas mínimas
- Cancelar la confirmación conserva la publicación.
- Eliminar la segunda de tres no afecta a las demás.
- Recargar no recupera la publicación eliminada.

Restricción técnica: Usar el id de la publicación; no borrar por posición visual ni por texto.

### H6. Editar una publicación (3 puntos)
Como estudiante, quiero corregir mi mensaje para solucionar errores sin eliminar la publicación.

Criterios de aceptación
- Cada publicación tiene una acción Editar.
- Se puede modificar el mensaje, pero no dejarlo vacío.
- Guardar actualiza la publicación correcta.
- Se conserva nombre, fecha original y cantidad de Me gusta.
- La edición permanece al recargar.

Pruebas mínimas
- Editar una publicación entre varias cambia solo la seleccionada.
- Intentar guardar vacío muestra una validación.
- Los Me gusta no se reinician.

Restricción técnica: No crear una publicación nueva al editar; actualizar el objeto existente.

### H7. Comentar publicaciones (5 puntos)
Como estudiante, quiero comentar una publicación para participar en la conversación.

Criterios de aceptación
- Cada publicación permite escribir nombre y comentario.
- Ambos campos son obligatorios.
- El comentario aparece dentro de la publicación correcta.
- Cada comentario muestra autor, texto y fecha/hora.
- Comentarios y publicaciones permanecen en LocalStorage.

Pruebas mínimas
- Agregar dos comentarios a una publicación.
- Comentar la segunda de varias publicaciones.
- Recargar conserva comentarios y su relación con la publicación.

Restricción técnica: Agregar a cada publicación una propiedad comentarios con un arreglo. Manejar publicaciones antiguas que todavía no tengan esa propiedad.

### H8. Buscar publicaciones (3 puntos)
Como estudiante, quiero buscar por autor o contenido para encontrar rápidamente una publicación.

Criterios de aceptación
- Existe un campo de búsqueda visible.
- La lista se filtra mientras se escribe o al presionar Buscar.
- Busca sin distinguir mayúsculas de minúsculas.
- Si se limpia el campo, vuelven todas las publicaciones.
- Si no hay coincidencias, se informa al usuario.

Pruebas mínimas
- Buscar parte de un nombre.
- Buscar una palabra del mensaje.
- Probar mayúsculas/minúsculas y un texto inexistente.

Restricción técnica: La búsqueda no debe modificar ni volver a guardar el arreglo original.

### H9. Ordenar publicaciones (3 puntos)
Como estudiante, quiero ordenar las publicaciones para ver primero las más recientes o las más populares.

Criterios de aceptación
- Se puede elegir Recientes, Antiguas o Más gustadas.
- El orden cambia correctamente sin perder datos.
- El criterio seleccionado funciona junto con la búsqueda.
- Recargar mantiene las publicaciones, aunque el selector vuelva al valor inicial.

Pruebas mínimas
- Crear publicaciones con diferentes fechas y Me gusta.
- Probar los tres órdenes.
- Buscar y luego ordenar los resultados.

Restricción técnica: Evitar alterar accidentalmente el arreglo principal al ordenar; se puede trabajar con una copia.

### H10. Resumen de actividad (2 puntos)
Como estudiante, quiero ver un resumen para conocer la actividad de la red social.

Criterios de aceptación
- Muestra total de publicaciones.
- Muestra total de Me gusta.
- Muestra total de comentarios si H7 está terminada; de lo contrario, indica cero.
- Los valores se actualizan después de publicar, editar, eliminar, comentar o reaccionar.

Pruebas mínimas
- Comprobar el resumen con LocalStorage vacío.
- Crear y eliminar una publicación.
- Dar varios Me gusta y verificar la suma.

Restricción técnica: Calcular los datos a partir del arreglo; no mantener contadores duplicados en LocalStorage.

### H13. Reacciones múltiples (5 puntos)
Como estudiante, quiero reaccionar de distintas maneras a una publicación para expresar mejor mi opinión.

Criterios de aceptación
- Cada publicación permite seleccionar una reacción: Me gusta, Me encanta o Me divierte.
- La aplicación muestra por separado la cantidad de cada tipo de reacción.
- Al seleccionar una reacción, aumenta únicamente el contador correspondiente de la publicación elegida.
- Las reacciones de una publicación no modifican las de las demás.
- Las cantidades permanecen después de recargar la página.
- Las publicaciones antiguas que solo tengan el contador Me gusta continúan mostrándose sin errores.
- El resumen de actividad incluye todas las reacciones si la H10 está implementada.

Pruebas mínimas
- Aplicar dos reacciones de cada tipo y verificar que los tres contadores sean correctos.
- Reaccionar a la segunda de tres publicaciones; las otras dos deben conservar sus valores.
- Recargar la página y comprobar que todas las cantidades permanezcan.
- Iniciar con datos antiguos de LocalStorage que no tengan las nuevas propiedades; la aplicación no debe fallar.
- Buscar u ordenar publicaciones y luego reaccionar; debe actualizarse la publicación correcta.

Restricción técnica: Ampliar cada publicación con una estructura de reacciones y asignar cero cuando una propiedad no exista. Evitar contadores separados fuera del objeto de la publicación.

### H14. Responder comentarios (5 puntos)
Como estudiante, quiero responder un comentario para continuar una conversación específica.

Dependencia: Requiere que H7 (comentarios) esté terminada.

Criterios de aceptación
- Cada comentario muestra la acción Responder.
- La respuesta solicita nombre y texto; ambos son obligatorios.
- La respuesta aparece debajo del comentario correcto y muestra autor, texto y fecha/hora.
- Un comentario puede tener varias respuestas.
- Las respuestas pueden agregarse en publicaciones diferentes sin mezclarse.
- Las respuestas permanecen después de recargar la página.
- Los comentarios antiguos sin respuestas continúan mostrándose sin errores.

Pruebas mínimas
- Responder el segundo comentario de una publicación con tres comentarios.
- Agregar dos respuestas al mismo comentario y una a otro comentario.
- Intentar responder con nombre vacío, texto vacío y solo espacios.
- Recargar y comprobar que se conserva la relación publicación–comentario–respuesta.
- Usar datos anteriores que no tengan la propiedad `respuestas`.

Restricción técnica: Cada respuesta posee un `id` único. La publicación y el comentario se localizan por `id`, sin utilizar posiciones visuales ni texto como identificador.

## 5. Pruebas de regresión obligatorias

| N.º | Prueba | Resultado esperado | Estado |
| --- | --- | --- | --- |
| R1 | Publicar con nombre y mensaje válidos | Aparece con fecha/hora | □ Pasa  □ Falla |
| R2 | Intentar publicar con campos vacíos | No permite publicar | □ Pasa  □ Falla |
| R3 | Dar Me gusta a una publicación | Aumenta la correcta | □ Pasa  □ Falla |
| R4 | Recargar la página | Datos y reacciones permanecen | □ Pasa  □ Falla |
| R5 | Ejecutar cada historia nueva | Cumple todos sus criterios | □ Pasa  □ Falla |
| R6 | Usar LocalStorage vacío | La aplicación inicia sin error | □ Pasa  □ Falla |
| R7 | Usar datos creados antes de esta sesión | La versión nueva no se rompe | □ Pasa  □ Falla |

## 6. Solicitud de revisión
Antes de llamar al docente o declarar una historia terminada, el equipo debe completar esta secuencia:
- El programador explica qué criterio está cumpliendo.
- El tester ejecuta las pruebas mínimas y al menos una prueba de error.
- El cliente compara el resultado con la historia, no con preferencias personales.
- El tracker registra puntos, errores y estado.
- La pareja guarda una versión funcional y luego toma otra historia.

## 7. Registro de la iteración

| Historia | Puntos | Responsables | Pruebas | Estado / observación |
| --- | --- | --- | --- | --- |
| H5 | 2 | | Eliminar una publicación □ Pasa  □ Falla | |
| H6 | 3 | | Editar una publicación □ Pasa  □ Falla | |
| H7 | 5 | | Comentar una publicación □ Pasa  □ Falla | |
| H8 | 3 | | Buscar publicaciones. □ Pasa  □ Falla | |
| H9 | 3 | | Ordenar publicaciones entre secciones. □ Pasa  □ Falla | |
| H10 | 2 | | Resumen de actividad de la red social. □ Pasa  □ Falla | |
| H11 | 2 | | Límite de 200 caracteres al crear y editar. □ Pasa  □ Falla | |
| H13 | 5 | | Reacciones múltiples (Me gusta, Me encanta, Me divierte). □ Pasa  □ Falla | |

### Errores importantes encontrados y corregidos:
________________________________________________________________________________
________________________________________________________________________________
________________________________________________________________________________

## 8. Demostración final de 2 minutos
- Mostrar la versión base todavía funcionando.
- Demostrar las historias nuevas aceptadas.
- Ejecutar una prueba de error y recargar la página.
- Indicar una mejora realizada al código.
- Responder: ¿qué entregaríamos en la próxima iteración?

**Definición de Terminado:** Una historia funciona, cumple todos sus criterios, fue probada, no rompe lo anterior, está integrada y puede demostrarse. "Casi funciona" permanece En desarrollo.

## Evidencias de cada una de las historias de usuario

### H1 y H2.





### H3.



### H4.





### H5.

## 9. Estado de verificación del código (sesión de continuidad)

Verificación realizada sobre el código actual (rama `main`) revisando los criterios de aceptación de cada historia:

| Historia | Puntos | Estado | Criterios cumplidos |
| --- | --- | --- | --- |
| H5 Eliminar | 2 | ✔ Implementada / cumple criterios | Botón Eliminar por publicación, confirmación con `window.confirm`, borra solo la seleccionada por `id` (storage.js `deletePost`), persiste en LocalStorage. Cumple la restricción técnica (usa `post.id`, no posición ni texto). |
| H6 Editar | 3 | ✔ Implementada / cumple criterios | Botón Editar por publicación, textarea inline, no permite guardar vacío (validación "El mensaje no puede estar vacío"), actualiza el objeto existente con `updatePost` sin tocar nombre/fecha/likes, persiste al recargar. |
| H7 Comentar | 5 | ✔ Implementada / cumple criterios | Botón Comentar despliega formulario con nombre y comentario (ambos obligatorios, validación de error), cada comentario muestra autor, texto y fecha/hora, se guardan en la propiedad `comentarios` de la publicación (storage.js `addComment`), maneja publicaciones antiguas sin la propiedad con `post.comentarios \|\| []`. |
| H8 Buscar | 3 | ✔ Implementada / cumple criterios | Campo de búsqueda en la barra superior, filtra al escribir (evento `input`), sin distinguir mayúsculas/minúsculas, al limpiar vuelven todas, si no hay coincidencias muestra "No se encontraron publicaciones para tu búsqueda". No modifica el arreglo original (`filter` sobre copia). |
| H9 Ordenar | 3 | ✔ Implementada / cumple criterios | Selector Recientes / Antiguas / Más gustadas, `ordenarPublicaciones` trabaja con copia (`[...posts]`) sin alterar el arreglo guardado, funciona junto con la búsqueda, al recargar las publicaciones se mantienen y el selector vuelve a "Más recientes". |
| H10 Resumen | 2 | ✔ Implementada / cumple criterios | Tarjeta de resumen con total de publicaciones, Me gusta y comentarios; se actualiza tras publicar, editar, eliminar, comentar o reaccionar (se recalcula en `renderPosts`); con LocalStorage vacío muestra 0; calcula todo desde el arreglo sin contadores duplicados. |
| H13 Reacciones múltiples | 5 | ✔ Implementada / cumple criterios | Cada publicación tiene tres botones (👍 Me gusta, ❤️ Me encanta, 😄 Me divierte) y una fila de contadores separados por tipo. `incrementReaction(postId, tipo)` (storage.js) aumenta solo el tipo indicado de la publicación buscada por `id`, sin tocar las demás. Los datos viven en `post.reacciones = { megusta, meencanta, medivierte }` dentro del objeto de la publicación; `normalizarPost` asigna cero a las propiedades faltantes y convierte el `likes` de las publicaciones antiguas en `megusta`, por lo que los datos previos no rompen la aplicación. `likes` se mantiene sincronizado con `megusta` para no alterar H9 (Más gustadas) ni H10. El resumen muestra los totales de los tres tipos. |
| H14 Responder comentarios | 5 | ✔ Implementada / cumple criterios | Cada comentario permite desplegar un formulario de respuesta con nombre y texto obligatorios. `addReply(postId, comentarioId, respuesta)` localiza ambos objetos por `id`, asigna un identificador único, guarda la respuesta dentro de `comentario.respuestas` y controla errores de validación, referencias inexistentes y escritura. Los datos antiguos se normalizan con `respuestas: []`. |
| H11 | 2 | ✔ Implementada / cumple criterios | Constante compartida `LIMITE_MENSAJE = 200` (publicaciones.js), `maxlength="200"` en el formulario de creación y en la edición, contador "Quedan N caracteres" en el compositor que se actualiza al escribir y vuelve a 200 al publicar, validación al crear y al guardar una edición (no permite superar el límite), resto de funciones sin cambios. |

### Funciones de la versión base (conservadas)
- Publicar con validación de nombre y mensaje: app.js.
- Listar publicaciones con fecha/hora almacenada y mostrada en formato relativo.
- Me gusta: publicaciones.js, storage.js `incrementLike`.
- LocalStorage: storage.js (getPosts/savePosts).

### Pruebas mínimas de H13 ejecutadas
| Prueba | Resultado |
| --- | --- |
| Dos reacciones de cada tipo en una publicación | Contadores 👍/❤️/😄 correctos (base + 2 en cada tipo). |
| Reaccionar a la segunda de tres publicaciones | Las otras dos conservan sus valores. |
| Recargar la página | Las tres cantidades permanecen (leídas desde `post.reacciones`). |
| Iniciar con datos antiguos sin las propiedades nuevas | La aplicación inicia sin errores; `likes` antiguo se muestra como Me gusta y el resto en cero. |
| Buscar u ordenar y luego reaccionar | Se actualiza la publicación correcta (los manejadores usan `post.id`). |
| LocalStorage vacío o con datos corruptos | Muestra el mensaje de lista vacía; `getPosts` devuelve `[]`. |

### Pruebas mínimas de H5 ejecutables en el código
- Cancelar confirmación conserva la publicación: cubierto por la salida temprana en el manejador de Eliminar.
- Eliminar la segunda de tres no afecta a las demás: `deletePost` filtra solo el id objetivo.
- Recargar no recupera la publicación: el borrado se persiste con `savePosts`.
