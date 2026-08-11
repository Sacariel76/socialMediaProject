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
| H11 | 2 | | - | |

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

Verificación realizada sobre el código actual (rama `main`, commit `5ec4b28`) revisando los criterios de aceptación de cada historia:

| Historia | Puntos | Estado | Criterios cumplidos |
| --- | --- | --- | --- |
| H5 Eliminar | 2 | ✔ Implementada / cumple criterios | Botón Eliminar por publicación (publicaciones.js:59), confirmación con `window.confirm` (publicaciones.js:65), borra solo la seleccionada por `id` (storage.js:72), persiste en LocalStorage (storage.js:79). Cumple la restricción técnica (usa `post.id`, no posición ni texto). |
| H6 Editar | 3 | ✘ No implementada | No existe acción Editar ni actualización del mensaje. |
| H7 Comentar | 5 | ✘ No implementada | No existe la propiedad `comentarios` ni formulario de comentarios. |
| H8 Buscar | 3 | ✘ No implementada | No existe campo de búsqueda. |
| H9 Ordenar | 3 | ✘ No implementada | No existe selector de orden. |
| H10 Resumen | 2 | ✘ No implementada | No existe resumen de actividad. |
| H11 | 2 | ✘ Sin especificación | No se indica el criterio en el backlog. |

### Funciones de la versión base (conservadas)
- Publicar con validación de nombre y mensaje: app.js:7-53.
- Listar publicaciones con fecha/hora almacenada: app.js:43, publicaciones.js:8.
- Me gusta: publicaciones.js:53, storage.js:50.
- LocalStorage: storage.js (getPosts/savePosts).

### Pruebas mínimas de H5 ejecutables en el código
- Cancelar confirmación conserva la publicación: cubierto por la salida temprana en publicaciones.js:69-71.
- Eliminar la segunda de tres no afecta a las demás: `deletePost` filtra solo el id objetivo.
- Recargar no recupera la publicación: el borrado se persiste con `savePosts`.
