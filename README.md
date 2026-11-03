# Curcert

Aplicación Vue y Quasar para gestionar profesores, alumnos, materias, inscripciones y calificaciones con Cloud Firestore y Firebase Authentication.

## Ejecutar

Usa Node.js 24 o 26 e instala las dependencias:

```bash
npm ci
npm run dev
```

Abre la dirección local que muestra Quasar. La página de profesores está en `/#/profesores`.

Para compilar: `npm run build`. El resultado queda en `dist/spa`.

## Configuración de Firebase

Copia `.env.example` a `.env.local` para una instalación nueva y rellena las seis variables con la configuración de la app web de tu proyecto de Firebase. Reinicia el servidor al cambiar esas variables. El proyecto local está asociado a `curcert-8fdb0`.

En Firebase Authentication debe estar habilitado Correo electrónico/contraseña. El dominio donde se ejecute la aplicación debe figurar en Dominios autorizados. Para desarrollo se utiliza `localhost`.

Las reglas de Firestore están en `firestore.rules`. Se pueden publicar desde la consola o con Firebase CLI: `firebase deploy --only firestore:rules`. El SDK web utiliza la base `(default)`.

## Datos y roles

Cada documento de la colección `profesores` contiene cinco cadenas: `nombre`, `apellidos`, `cedula`, `especialidad` y `correo`. Firestore genera el ID del documento y la aplicación lo expone como `profesor_id`. Los documentos de inicialización que no contienen ninguno de estos campos se omiten en la lista.

Los permisos se asignan en `perfiles/{uid}`, usando como ID el UID de Firebase Authentication y un campo `rol`:

| Rol           | Consultar | Crear y editar | Eliminar |
| ------------- | --------- | -------------- | -------- |
| administrador | Sí        | Sí             | Sí       |
| captura       | Sí        | Sí             | No       |
| consulta      | Sí        | No             | No       |
| pendiente     | No        | No             | No       |

Las cuentas que se registran en la app comienzan pendientes. Para autorizar una cuenta, un administrador del proyecto edita su documento de perfil desde la consola de Firestore y asigna el rol correspondiente. Los clientes no pueden modificar su rol.

Para el primer administrador: inicia sesión en Curcert, copia el identificador que muestra la pantalla de autorización y asigna `rol: administrador` en su documento de `perfiles`. Después pulsa Comprobar acceso.

El login, la lista y los formularios utilizan Firebase. No se transfieren automáticamente los usuarios ni los datos que existieran en Supabase.

## Unidad 2 Resultado de aprendizaje 1

El modelo se basa en el documento U1 RA1 y su diagrama escolar. Cada carpeta de `src/pages/{coleccion}` incluye `index.vue`, `create.vue` y `edit_[id].vue`, además de su contenedor de diseño compartido.

| Colección      | Ruta            | Store                | Campos de datos                                        |
| -------------- | --------------- | -------------------- | ------------------------------------------------------ |
| alumnos        | /alumnos        | alumnoStore.js       | nombre, apellidos, matricula, fecha_nacimiento, genero |
| materias       | /materias       | materiaStore.js      | nombre, profesor_id, unidades                          |
| inscripciones  | /inscripciones  | inscripcionStore.js  | alumno_id, materia_id, periodo                         |
| calificaciones | /calificaciones | calificacionStore.js | inscripcion_id, alumno_id, calificacion, parcial       |

Los cuatro stores comparten operaciones en `coleccionStore.js` y validaciones en `collectionSchemas.js`. Los ID de Firestore se exponen como alumno_id, materia_id, inscripcion_id y calificacion_id. Las colecciones se crean al guardar su primer documento; no necesitan registros vacíos de inicialización.

### Captura y validaciones

Crear primero profesores y alumnos; después materias, inscripciones y calificaciones. El alumno de una calificación se obtiene de la inscripción. Unidades admite enteros de 1 a 20; calificación admite valores de 0 a 10; parcial admite enteros de 1 a 3. Estos rangos son criterios de esta implementación. Matrícula se normaliza a mayúsculas. Fecha de nacimiento y género son opcionales.

La aplicación rechaza matrículas repetidas, inscripciones repetidas del mismo alumno/materia/periodo y notas repetidas por inscripción/parcial. Impide borrar padres con registros relacionados o cambiar alumno/materia de una inscripción con notas. Estos controles son preventivos del cliente: no constituyen garantías transaccionales ante concurrencia o accesos mediante otros clientes. Las reglas validan roles, tipos, rangos y existencia de referencias; la validación completa de fechas ocurre en el cliente.

### Verificación

`node --test tests/collectionSchemas.test.mjs` ejecuta las pruebas de validación sin conexión. `npm run build` compila la plataforma. Para comprobar denegación de lectura anónima en Firebase desde PowerShell:

```powershell
$env:FIREBASE_SMOKE = '1'
node --test tests/firebase-access.test.mjs
Remove-Item Env:FIREBASE_SMOKE
```

La prueba funcional requiere publicar `firestore.rules`, iniciar sesión con administrador y crear, consultar, editar, recargar y eliminar registros desde cada página. Borrar los datos de prueba en orden inverso: calificaciones, inscripciones, materias, alumnos y profesores. El informe institucional está en `docs/OPTA1_U2_RA1_Curcert.docx`; sus resultados distinguen las verificaciones realizadas de las pendientes.
