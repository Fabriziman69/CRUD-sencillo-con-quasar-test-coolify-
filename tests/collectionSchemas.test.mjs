import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createEmptyForm, normalizeRecord, validateRecord } from '../src/utils/collectionSchemas.js'

const fixtures = {
  alumnos: {
    nombre: 'Ana',
    apellidos: 'Prueba',
    matricula: 'TEST-001',
    fecha_nacimiento: '2004-02-29',
    genero: '',
  },
  materias: { nombre: 'Bases de datos', profesor_id: 'profesor-prueba', unidades: 4 },
  inscripciones: { alumno_id: 'alumno-prueba', materia_id: 'materia-prueba', periodo: '2026-3' },
  calificaciones: {
    alumno_id: 'alumno-prueba',
    inscripcion_id: 'inscripcion-prueba',
    calificacion: 8.5,
    parcial: 1,
  },
}

function validation(collectionName, changes) {
  return validateRecord(
    collectionName,
    normalizeRecord(collectionName, { ...fixtures[collectionName], ...changes }),
  )
}

for (const [collectionName, fixture] of Object.entries(fixtures)) {
  test(`${collectionName}: acepta un registro válido`, () => {
    assert.equal(validateRecord(collectionName, fixture), '')
  })

  test(`${collectionName}: rechaza formulario vacío`, () => {
    assert.match(validateRecord(collectionName, createEmptyForm(collectionName)), /obligatorio/)
  })

  test(`${collectionName}: no envía el ID ni campos ajenos al modelo`, () => {
    const clean = normalizeRecord(collectionName, {
      ...fixture,
      alumno_id_suplantado: 'otro',
      rol: 'administrador',
      id: 'id-generado-por-firestore',
    })
    assert.deepEqual(Object.keys(clean).sort(), Object.keys(fixture).sort())
    assert.equal('rol' in clean, false)
    assert.equal('id' in clean, false)
  })
}

test('Alumno: recorta texto y unifica matrícula antes de buscar duplicados', () => {
  const normalized = normalizeRecord('alumnos', {
    ...fixtures.alumnos,
    nombre: '  Ana  ',
    matricula: '  test-001  ',
  })
  assert.equal(normalized.nombre, 'Ana')
  assert.equal(normalized.matricula, 'TEST-001')
  assert.equal(fixtures.alumnos.nombre, 'Ana')
})

test('Alumno: nombre de espacios no cuenta como obligatorio', () => {
  assert.match(validation('alumnos', { nombre: '   ' }), /obligatorio/)
})

test('Alumno: permite omitir fecha de nacimiento y género', () => {
  assert.equal(validation('alumnos', { fecha_nacimiento: undefined, genero: undefined }), '')
})

for (const [field, max] of [
  ['nombre', 100],
  ['apellidos', 150],
  ['matricula', 20],
  ['genero', 20],
]) {
  test(`Alumno: respeta límite de ${field}`, () => {
    assert.equal(validation('alumnos', { [field]: 'a'.repeat(max) }), '')
    assert.match(validation('alumnos', { [field]: 'a'.repeat(max + 1) }), /caracteres/)
  })
}

for (const invalidDate of ['2025-02-29', '2026-04-31', '2026-13-01', '01/01/2004', 'no-es-fecha']) {
  test(`Alumno: rechaza fecha inválida ${invalidDate}`, () => {
    assert.match(validation('alumnos', { fecha_nacimiento: invalidDate }), /no es válida/)
  })
}

test('Alumno: rechaza nacimiento futuro', () => {
  assert.match(validation('alumnos', { fecha_nacimiento: '9999-12-31' }), /futura/)
})

test('Materia: convierte unidades del formulario a número', () => {
  assert.equal(normalizeRecord('materias', { ...fixtures.materias, unidades: '4' }).unidades, 4)
})

for (const units of [0, 21, 1.5, Infinity, NaN, 'texto']) {
  test(`Materia: rechaza unidades inválidas ${String(units)}`, () => {
    assert.notEqual(validation('materias', { unidades: units }), '')
  })
}

test('Inscripción: exige alumno, materia y periodo', () => {
  for (const field of ['alumno_id', 'materia_id', 'periodo']) {
    assert.match(validation('inscripciones', { [field]: '' }), /obligatorio/)
  }
})

test('Inscripción: no admite un periodo mayor de 50 caracteres', () => {
  assert.match(validation('inscripciones', { periodo: 'a'.repeat(51) }), /caracteres/)
})

test('Referencias: rechaza rutas de documentos en lugar de IDs', () => {
  assert.match(validation('materias', { profesor_id: 'profesores/otro' }), /no es válido/)
  assert.match(validation('inscripciones', { alumno_id: 'alumnos/otro' }), /no es válido/)
  assert.match(
    validation('calificaciones', { inscripcion_id: 'inscripciones/otra' }),
    /no es válido/,
  )
})

test('Referencias: rechaza identificadores demasiado largos', () => {
  assert.match(validation('materias', { profesor_id: 'a'.repeat(1501) }), /no es válido/)
})

test('Calificación: acepta cero, diez y valores decimales dentro de rango', () => {
  for (const grade of [0, 7.5, 10])
    assert.equal(validation('calificaciones', { calificacion: grade }), '')
})

for (const grade of [-0.1, 10.1, Infinity, NaN, 'texto']) {
  test(`Calificación: rechaza valor inválido ${String(grade)}`, () => {
    assert.notEqual(validation('calificaciones', { calificacion: grade }), '')
  })
}

test('Calificación: no confunde campo vacío con cero', () => {
  for (const value of ['', null, undefined]) {
    assert.match(validation('calificaciones', { calificacion: value }), /obligatorio/)
  }
})

for (const partial of [0, 4, 1.5]) {
  test(`Calificación: rechaza parcial inválido ${partial}`, () => {
    assert.notEqual(validation('calificaciones', { parcial: partial }), '')
  })
}

test('Reinicio: los formularios nuevos son independientes', () => {
  const first = createEmptyForm('alumnos')
  first.nombre = 'No conservar'
  assert.equal(createEmptyForm('alumnos').nombre, '')
})
