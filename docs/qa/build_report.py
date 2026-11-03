from pathlib import Path
from copy import deepcopy
import hashlib
import json
import zipfile

from docx import Document
from docx.shared import Inches, Cm, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.section import WD_SECTION_START
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.enum.style import WD_STYLE_TYPE
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

ROOT = Path(__file__).resolve().parents[2]
QA = ROOT / 'docs' / 'qa'
REF = ROOT.parent.parent / 'U1 RA1.docx'
OUT = ROOT / 'docs' / 'OPTA1_U2_RA1_Curcert.docx'
RESULTS = json.loads((QA / 'resultados.json').read_text(encoding='utf-8'))
assert hashlib.sha256(REF.read_bytes()).hexdigest() == 'fe4831811cd7222be46583e12216e32566495997871ce62c54c0059774cef233'

doc = Document(REF)
logo = deepcopy(doc.paragraphs[0]._p)
body = doc._element.body
for child in list(body):
    if child.tag != qn('w:sectPr'):
        body.remove(child)
section = doc.sections[0]
for sect in doc.sections:
    sect.page_width = Inches(8.5)
    sect.page_height = Inches(11)
    sect.top_margin = sect.bottom_margin = sect.left_margin = sect.right_margin = Cm(2.5)
    sect.header_distance = sect.footer_distance = Cm(1.25)
    for el in list(sect._sectPr):
        if el.tag in (qn('w:pgNumType'), qn('w:headerReference'), qn('w:footerReference')):
            sect._sectPr.remove(el)
doc.core_properties.title = 'OPTA1 Unidad 2 Resultado de aprendizaje 1 Curcert'
doc.core_properties.subject = 'Implementación y pruebas de los CRUD de Curcert'
doc.core_properties.author = 'Fabrizio Rodriguez Gonzalez'
doc.core_properties.last_modified_by = 'Fabrizio Rodriguez Gonzalez'
doc.core_properties.comments = ''

for name in ['Normal', 'Body Text', 'Title', 'Subtitle', 'Heading 1', 'Heading 2', 'Heading 3', 'Caption']:
    style = doc.styles[name]
    style.font.name = 'Arial'
    style.font.color.rgb = RGBColor(0, 0, 0)
    rpr = style.element.get_or_add_rPr()
    color = rpr.find(qn('w:color'))
    if color is not None:
        for key in ('themeColor', 'themeTint', 'themeShade'):
            color.attrib.pop(qn('w:' + key), None)
    pp = style.element.get_or_add_pPr()
    for b in list(pp.findall(qn('w:pBdr'))):
        pp.remove(b)
normal = doc.styles['Normal']
normal.font.size = Pt(11)
normal.paragraph_format.line_spacing = 1.15
normal.paragraph_format.space_after = Pt(7)
normal.paragraph_format.space_before = Pt(0)
normal.paragraph_format.widow_control = True
for name, size in [('Title', 19), ('Heading 1', 15), ('Heading 2', 12), ('Heading 3', 11)]:
    s = doc.styles[name]
    s.font.size = Pt(size)
    s.font.bold = True
    s.paragraph_format.space_before = Pt(12)
    s.paragraph_format.space_after = Pt(7)
    s.paragraph_format.keep_with_next = True
doc.styles['Caption'].font.size = Pt(9)
doc.styles['Caption'].font.italic = False
doc.styles['Caption'].paragraph_format.space_after = Pt(9)

numbering = doc.part.numbering_part.element
for name, fmt, text, ident in [('List Number', 'decimal', '%1.', 101), ('List Bullet', 'bullet', '•', 102)]:
    if name not in doc.styles:
        doc.styles.add_style(name, WD_STYLE_TYPE.PARAGRAPH)
    ls = doc.styles[name]
    ls.base_style = doc.styles['Normal']
    ls.paragraph_format.space_after = Pt(8)
    abstract = OxmlElement('w:abstractNum')
    abstract.set(qn('w:abstractNumId'), str(ident))
    level = OxmlElement('w:lvl')
    level.set(qn('w:ilvl'), '0')
    for tag, value in [('start', '1'), ('numFmt', fmt), ('lvlText', text), ('lvlJc', 'left')]:
        item = OxmlElement('w:' + tag)
        item.set(qn('w:val'), value)
        level.append(item)
    pp = OxmlElement('w:pPr')
    ind = OxmlElement('w:ind')
    ind.set(qn('w:left'), '360')
    ind.set(qn('w:hanging'), '300')
    pp.append(ind)
    level.append(pp)
    abstract.append(level)
    numbering.append(abstract)
    num = OxmlElement('w:num')
    num.set(qn('w:numId'), str(ident))
    aid = OxmlElement('w:abstractNumId')
    aid.set(qn('w:val'), str(ident))
    num.append(aid)
    numbering.append(num)
    np = OxmlElement('w:numPr')
    ni = OxmlElement('w:numId')
    ni.set(qn('w:val'), str(ident))
    np.append(ni)
    ls.element.get_or_add_pPr().append(np)

def p(text='', style=None, align=None):
    para = doc.add_paragraph(text, style)
    if align is not None:
        para.alignment = align
    if style in ('List Number', 'List Bullet'):
        pp = para._p.get_or_add_pPr()
        np = pp.find(qn('w:numPr'))
        if np is None:
            np = OxmlElement('w:numPr')
            pp.append(np)
        for item in list(np):
            np.remove(item)
        level = OxmlElement('w:ilvl')
        level.set(qn('w:val'), '0')
        ni = OxmlElement('w:numId')
        ni.set(qn('w:val'), '101' if style == 'List Number' else '102')
        np.append(level)
        np.append(ni)
    return para

def heading(text, level=1):
    return doc.add_heading(text, level)

def new_page():
    doc.add_page_break()

def table(headers, rows, widths):
    t = doc.add_table(rows=1, cols=len(headers))
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    t.autofit = False
    for cell, text, width in zip(t.rows[0].cells, headers, widths):
        cell.text = text
        cell.width = Cm(width)
    for row in rows:
        cells = t.add_row().cells
        for cell, text, width in zip(cells, row, widths):
            cell.text = str(text)
            cell.width = Cm(width)
    for row_index, row in enumerate(t.rows):
        trpr = row._tr.get_or_add_trPr()
        keep = OxmlElement('w:cantSplit')
        trpr.append(keep)
        if row_index == 0:
            repeat = OxmlElement('w:tblHeader')
            trpr.append(repeat)
        for cell in row.cells:
            cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
            tcpr = cell._tc.get_or_add_tcPr()
            margins = OxmlElement('w:tcMar')
            for edge in ['top', 'left', 'bottom', 'right']:
                e = OxmlElement('w:' + edge)
                e.set(qn('w:w'), '90')
                e.set(qn('w:type'), 'dxa')
                margins.append(e)
            tcpr.append(margins)
            shade = OxmlElement('w:shd')
            shade.set(qn('w:fill'), '353535' if row_index == 0 else ('F4F4F4' if row_index % 2 == 0 else 'FFFFFF'))
            tcpr.append(shade)
            for para in cell.paragraphs:
                para.paragraph_format.space_before = Pt(0)
                para.paragraph_format.space_after = Pt(0)
                para.paragraph_format.line_spacing = 1.05
                for run in para.runs:
                    run.font.name = 'Arial'
                    run.font.size = Pt(9)
                    run.bold = row_index == 0
                    run.font.color.rgb = RGBColor.from_string('FFFFFF' if row_index == 0 else '000000')
    borders = OxmlElement('w:tblBorders')
    for side in ['top', 'left', 'bottom', 'right', 'insideH', 'insideV']:
        edge = OxmlElement('w:' + side)
        edge.set(qn('w:val'), 'single')
        edge.set(qn('w:sz'), '4')
        edge.set(qn('w:color'), 'D9D9D9')
        borders.append(edge)
    t._tbl.tblPr.append(borders)
    p().paragraph_format.space_after = Pt(0)
    return t

def footer_number(section, fmt='decimal', start=1):
    section.footer.is_linked_to_previous = False
    para = section.footer.paragraphs[0]
    para.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    para.clear()
    fld = OxmlElement('w:fldSimple')
    fld.set(qn('w:instr'), 'PAGE')
    para._p.append(fld)
    num = OxmlElement('w:pgNumType')
    num.set(qn('w:fmt'), fmt)
    num.set(qn('w:start'), str(start))
    section._sectPr.append(num)

def new_section(numbering):
    sect = doc.add_section(WD_SECTION_START.NEW_PAGE)
    sect.page_width = Inches(8.5)
    sect.page_height = Inches(11)
    sect.top_margin = sect.bottom_margin = sect.left_margin = sect.right_margin = Cm(2.5)
    sect.header_distance = sect.footer_distance = Cm(1.25)
    footer_number(sect, numbering)
    return sect

# Portada institucional derivada de la referencia retenida.
body.insert(0, logo)
logo_para = doc.paragraphs[0]
logo_para.paragraph_format.space_after = Pt(20)
for extent in logo.xpath('.//wp:extent'):
    extent.set('cx', str(int(Inches(4.65))))
    extent.set('cy', str(int(Inches(2.62))))
for ext in logo.xpath('.//a:xfrm/a:ext'):
    ext.set('cx', str(int(Inches(4.65))))
    ext.set('cy', str(int(Inches(2.62))))
for text, size, bold, space_after in [
    ('OPTA1 UNIDAD 2', 18, True, 6),
    ('RESULTADO DE APRENDIZAJE 1', 17, True, 12),
    ('Desarrollo y pruebas del proyecto Curcert', 18, True, 20),
    ('TÉCNICO SUPERIOR UNIVERSITARIO EN\nDESARROLLO DE SOFTWARE MULTIPLATAFORMA\nÁREA DE DESARROLLO DE SOFTWARE', 12, True, 18),
    ('PRESENTA', 12, True, 5),
    ('FABRIZIO RODRIGUEZ GONZALEZ', 15, True, 16),
    ('Docente  [agregar]     Grupo  [agregar]\nMatrícula  [agregar]', 10, False, 16),
    ('CD. REYNOSA, TAMAULIPAS\n' + RESULTS['fecha'].upper(), 10, True, 0),
]:
    para = p(text, 'Title' if text == 'Desarrollo y pruebas del proyecto Curcert' else None, WD_ALIGN_PARAGRAPH.CENTER)
    para.paragraph_format.space_after = Pt(space_after)
    para.paragraph_format.space_before = Pt(0)
    para.paragraph_format.line_spacing = 1.1
    for run in para.runs:
        run.font.size = Pt(size)
        run.bold = bold

new_section('lowerRoman')
p('Índice', 'Title')
toc = p()
field = OxmlElement('w:fldSimple')
field.set(qn('w:instr'), 'TOC \\o "1-1" \\h \\z \\u')
toc._p.append(field)
p('Asignatura  Optativa 1', align=WD_ALIGN_PARAGRAPH.LEFT)
p('Unidad 2   Resultado de aprendizaje 1', align=WD_ALIGN_PARAGRAPH.LEFT)

new_section('decimal')
heading('Introducción y objetivo')
p('En esta actividad completo los módulos de gestión escolar de Curcert. La aplicación utiliza Vue, Quasar y Pinia para la interfaz y el manejo de datos, junto con Firebase Authentication y Cloud Firestore para el acceso y la persistencia. El trabajo comprende las operaciones de crear, consultar, editar y eliminar registros, conocidas como CRUD.')
p('El objetivo es disponer de un módulo funcional para cada entidad del modelo académico: profesores, alumnos, materias, inscripciones y calificaciones. El modelo corresponde al diseño de la Unidad 1; en esta etapa se integra a la aplicación y se verifica su funcionamiento.')
heading('Alcance de la actividad', 2)
p('El módulo de profesores ya estaba integrado con Firebase. Los módulos incorporados son alumnos, materias, inscripciones y calificaciones. También se actualizan la navegación, las validaciones y los permisos necesarios para utilizarlos. La colección perfiles conserva su función de autorización y no se expone como un CRUD académico.')
table(['Requisito', 'Implementación'], [
    ['Crear las colecciones faltantes', 'alumnos, materias, inscripciones y calificaciones en Cloud Firestore.'],
    ['Crear las carpetas de CRUD', 'Cada módulo incluye index.vue, create.vue y edit_[id].vue.'],
    ['Crear los stores', 'Un store de Pinia para cada colección académica.'],
    ['Probar cada página nueva', 'Alta, consulta, edición y eliminación de registros temporales; comprobación de relaciones y permisos.'],
], [5.0, 11.59])
p(RESULTS['resumen'])

new_page()
heading('Modelo de datos')
p('Las entidades se almacenan como colecciones de documentos. El identificador de cada documento se utiliza en las relaciones y la aplicación lo expone con el nombre de su entidad, por ejemplo alumno_id. Los datos de profesores conservan los nombres empleados en Curcert, incluido correo.')
table(['Colección', 'Campos del modelo'], [
    ['profesores', 'profesor_id, nombre, apellidos, cedula, especialidad, correo'],
    ['alumnos', 'alumno_id, nombre, apellidos, matricula, fecha_nacimiento, genero'],
    ['materias', 'materia_id, profesor_id, nombre, unidades'],
    ['inscripciones', 'inscripcion_id, alumno_id, materia_id, periodo'],
    ['calificaciones', 'calificacion_id, alumno_id, inscripcion_id, calificacion, parcial'],
    ['perfiles', 'UID de autenticación y rol de autorización'],
], [3.2, 13.39])
heading('Relaciones entre las colecciones', 2)
p('Cada materia se vincula con un profesor mediante profesor_id. Una inscripción relaciona a un alumno con una materia y un periodo. Cada calificación pertenece a una inscripción; por ello, su alumno_id debe coincidir con el alumno inscrito.')
table(['Origen', 'Relación', 'Destino'], [
    ['profesores', 'Un profesor puede impartir varias materias', 'materias'],
    ['alumnos', 'Un alumno puede tener varias inscripciones', 'inscripciones'],
    ['materias', 'Una materia puede tener varias inscripciones', 'inscripciones'],
    ['inscripciones', 'Una inscripción puede recibir varias calificaciones', 'calificaciones'],
], [3.3, 9.99, 3.3])
p('Las colecciones se materializan al guardar su primer documento. Al eliminar todos los registros de una colección de prueba, Firestore puede dejar de mostrarla en la consola; esto no elimina el módulo de la aplicación ni sus reglas.')

new_page()
heading('Estructura de los módulos CRUD')
p('Cada módulo sigue la misma organización. La página index.vue presenta los registros y las acciones disponibles; create.vue permite capturar un registro; edit_[id].vue carga y actualiza el documento seleccionado. El archivo contenedor del módulo utiliza el diseño compartido de Curcert.')
table(['Colección', 'Carpeta de páginas', 'Store'], [
    ['profesores', 'src/pages/profesores/', 'profesoreStore.js'],
    ['alumnos', 'src/pages/alumnos/', 'alumnoStore.js'],
    ['materias', 'src/pages/materias/', 'materiaStore.js'],
    ['inscripciones', 'src/pages/inscripciones/', 'inscripcionStore.js'],
    ['calificaciones', 'src/pages/calificaciones/', 'calificacionStore.js'],
], [3.1, 7.7, 5.79])
heading('Responsabilidad de los stores', 2)
p('Los stores concentran la consulta, la lectura por identificador, el alta, la edición y la eliminación. Además, mantienen el formulario, la lista de registros y los estados de carga, guardado y error. Los cuatro stores nuevos utilizan coleccionStore.js para compartir estas operaciones y aplican las validaciones de su entidad.')
heading('Navegación y acceso', 2)
p('El menú incorpora acceso a las cinco colecciones académicas. Las rutas de captura y edición requieren una cuenta autorizada. Una cuenta sin rol operativo permanece en la pantalla de autorización hasta que se le asigne un permiso desde un entorno de administración confiable.')
p('Se conservan las APIs existentes del módulo de profesores, como profesorForm, getProfesores, getProfesoresByID, onSubmitNewProfesor, onSubmiteditProfesor y deleteProfesor. Las nuevas entidades utilizan nombres equivalentes relacionados con su propio modelo.')

new_page()
heading('Validaciones y permisos')
p('Las validaciones del formulario ayudan a corregir los datos antes de guardarlos. Las reglas de Firestore aplican los permisos y las condiciones de escritura en la base de datos. El comportamiento específico confirmado se registra en los resultados de verificación.')
table(['Rol', 'Consultar', 'Crear y editar', 'Eliminar'], [
    ['administrador', 'Sí', 'Sí', 'Sí'],
    ['captura', 'Sí', 'Sí', 'No'],
    ['consulta', 'Sí', 'No', 'No'],
    ['pendiente', 'No', 'No', 'No'],
], [5.1, 3.2, 4.49, 3.8])
heading('Integridad de los registros', 2)
p('Los identificadores relacionados se seleccionan desde registros existentes. La matrícula identifica al alumno; la inscripción relaciona alumno, materia y periodo; la calificación se captura para una inscripción y un parcial.')
for item in RESULTS.get('validaciones', []):
    p(item, 'List Bullet')
heading('Configuración del entorno', 2)
p('Para ejecutar el proyecto se instalan sus dependencias con npm ci y se inicia el entorno local con npm run dev. La configuración web de Firebase se mantiene en .env.local, tomando como referencia .env.example. Se requiere habilitar el acceso por correo y contraseña y aplicar las reglas de firestore.rules al proyecto configurado.')
p('La compilación de producción se genera con npm run build. Las cuentas nuevas reciben el rol pendiente; la asignación de permisos se realiza fuera del cliente. El documento no incluye contraseñas ni credenciales privadas.')

new_page()
heading('Procedimiento de uso y prueba')
p('La secuencia de captura respeta las dependencias del modelo. Primero se crean los registros independientes y después los que los relacionan. Para retirar los datos de prueba se utiliza el orden inverso.')
for text in [
    'Iniciar sesión con una cuenta administradora y acceder al menú de Curcert.',
    'Crear un profesor de prueba y un alumno de prueba. Comprobar que aparecen en sus listas.',
    'Crear una materia y seleccionar el profesor previamente registrado.',
    'Crear una inscripción seleccionando el alumno, la materia y el periodo.',
    'Crear una calificación para esa inscripción y establecer el parcial y la nota.',
    'Abrir cada registro desde su lista, modificar un campo y guardar. Recargar para comprobar la persistencia.',
    'Eliminar primero la calificación, después la inscripción, la materia y los registros independientes utilizados en la prueba.',
    'Confirmar que los registros temporales ya no aparecen y que los registros ajenos a la prueba permanecen intactos.',
]:
    p(text, 'List Number')
heading('Criterios de aceptación', 2)
p('Una prueba se considera aprobada cuando el registro aparece después del alta, conserva el cambio después de la edición y desaparece después de confirmar la eliminación. La revisión de campos y relaciones se evalúa por separado de la compilación del proyecto.')
p('Los resultados de las páginas nuevas se presentan por colección. Las capturas complementan la evidencia funcional y deben corresponder a los registros temporales utilizados en esta ejecución.')

new_page()
heading('Resultados de las pruebas')
if RESULTS['pruebas']:
    table(['Módulo', 'Crear', 'Consultar', 'Editar', 'Eliminar'], RESULTS['pruebas'], [4.59, 3.0, 3.0, 3.0, 3.0])
else:
    p('Pendiente de incorporar los resultados de la ejecución de pruebas.')
heading('Verificaciones adicionales', 2)
if RESULTS['verificaciones']:
    for text in RESULTS['verificaciones']:
        p(text, 'List Bullet')
else:
    p('Pendiente de incorporar los resultados de compilación, formato y validación de seguridad.')
if RESULTS['observaciones']:
    heading('Observaciones de la ejecución', 2)
    for text in RESULTS['observaciones']:
        p(text)

if RESULTS['capturas']:
    for i, capture in enumerate(RESULTS['capturas']):
        new_page()
        if i == 0:
            heading('Evidencia de funcionamiento')
        heading(capture['titulo'], 2)
        paragraph = p()
        paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
        if capture.get('ruta'):
            paragraph.add_run().add_picture(str(ROOT / capture['ruta']), width=Cm(8))
            paragraph.add_run('  ')
        paragraph.add_run().add_picture(str(ROOT / capture['baja']), width=Cm(8))
        paragraph.paragraph_format.keep_with_next = True
        p(f"Figura {i + 1}. {capture['descripcion']}", 'Caption')

new_page()
heading('Conclusión')
p(RESULTS.get('conclusion', 'La actividad integra las entidades escolares del modelo de la Unidad 1 en una plataforma con operaciones de captura, consulta, edición y eliminación. La evaluación final se completa con los resultados de las pruebas funcionales y las comprobaciones del proyecto.'))
heading('Referencias de la actividad')
p('Rodriguez Gonzalez, F. Unidad 1 RA 1 Creación de una base de datos escolar. Documento académico local utilizado como referencia del modelo de alumnos, profesores, materias, inscripciones y calificaciones.')
p('Diagrama sin título.drawio.png. Modelo relacional escolar de la Unidad 1, conservado en la carpeta de la asignatura.')
p('Código fuente del proyecto Curcert. Carpetas src/pages y src/stores, configuración de Firebase y archivo firestore.rules correspondientes a esta entrega.')
p('Consigna OPTA1 Unidad 2 Resultado de aprendizaje 1. Creación de colecciones, páginas y stores, y prueba de altas, ediciones y eliminaciones.')

settings = doc.settings.element
uf = settings.find(qn('w:updateFields'))
if uf is None:
    uf = OxmlElement('w:updateFields')
    settings.append(uf)
uf.set(qn('w:val'), 'true')
OUT.parent.mkdir(parents=True, exist_ok=True)
doc.save(OUT)
print(OUT)
print('Final evidence:', RESULTS['final'])
