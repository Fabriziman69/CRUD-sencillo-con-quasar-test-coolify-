# Contrato del documento institucional

Referencia conservada: `C:\Users\HP\Documents\uni\INGENIERIA\BASES_DE_DATOS_EN_LA_NUBE\U1 RA1.docx`.
SHA256: `fe4831811cd7222be46583e12216e32566495997871ce62c54c0059774cef233`.
Render de referencia: `template-reference-render/reference.pdf`, cinco paginas inspeccionadas.
La referencia permanece sin modificar. Se copia su paquete para conservar logo, tema y estilos de base.

## Patrones observados

- Tres secciones: portada, indice, cuerpo. Carta vertical, una columna. Margen izquierdo4cm, resto aproximadamente2.5cm salvo portada (superior1.9/inferior1.59). Distancia pie1.25cm.
- Portada centrada con logo UTTN verde, unidad Tahoma18 negrita, titulo Tahoma18, carrera Arial16 negrita, presenta Tahoma16, autor Monotype Corsiva22 negrita, lugar/fecha Arial14.
- Cuerpo Arial12, negro, justificado; encabezados Arial18 negrita y subtitulos Arial14 negrita; interlineado amplio. Figuras centradas, pies Arial10. Numeracion inferior derecha, indice romano y cuerpo decimal desde1. Sin encabezado.
- Indice por campos TOC y paginacion PAGE. No tablas en referencia. Cinco paginas con portada, indice y tres paginas de desarrollo.

## Ajustes autorizados para esta actividad

La referencia controla identidad visual y estructura de portada; el nuevo contenido reemplaza todos los textos y figuras academicas de U1. Solicitud de coordinacion: carta, margenes2.5cm, titulos negros sobrios, documento de U2 RA1 con fecha30octubre2026. Se regulariza tipografia Arial y se elimina puntuacion decorativa en titulos. Se conserva logo UTTN y estructura portada/indice/cuerpo. El indice se actualiza mediante Word; el cuerpo crece segun contenido.

## Mapa de edicion

- `word/document.xml` primer parrafo con dibujo rId: preservar logo; unidad/titulo/carrera/autor/lugar/fecha reemplazables.
- Cuerpo completo despues de portada: reemplazar por objetivo, alcance, modelo, CRUD, configuracion, validaciones, pruebas y referencias.
- `word/media/image1.png`: preservar bytes del logo institucional.
- Figuras restantes U1: no utilizar en resultado, relaciones del paquete conservadas si Python-docx las retiene. Agregar unicamente capturas nuevas confirmadas.
- Styles y document.xml: editables para titulo negro, margenes, bloques y tablas. Tema, fuentes, numeracion heredada y propiedades generales se conservan salvo metadatos autor/titulo de la nueva actividad.
- Footer: numeracion PAGE nueva en cuerpo; sin numero visible en portada. Campos refrescados mediante Word antes del render final.
- Docente, grupo y matricula: [agregar], sin inventar datos.

## Verificacion

Renderer empaquetado ejecutado; fallo porque bundled LibreOffice no existe. No se usara LibreOffice de escritorio. Alternativa comprobada: Word COM oculto exporta PDF y Poppler genera PNG; se inspeccionan todas las paginas. El original se abre solo lectura y se valida SHA al construir. Capturas y estados de prueba solo se incorporan cuando el coordinador entrega evidencia real. Resultado solicitado: `docs/OPTA1_U2_RA1_Curcert.docx`; QA no se entrega.
