export const collectionSchemas = {
  alumnos: {
    collection: 'alumnos',
    idField: 'alumno_id',
    singular: 'alumno',
    title: 'Alumnos',
    labelField: 'nombre',
    fields: [
      { name: 'nombre', label: 'Nombre', type: 'text', required: true, maxLength: 100 },
      { name: 'apellidos', label: 'Apellidos', type: 'text', required: true, maxLength: 150 },
      { name: 'matricula', label: 'Matrícula', type: 'text', required: true, maxLength: 20 },
      { name: 'fecha_nacimiento', label: 'Fecha de nacimiento', type: 'date', required: false },
      { name: 'genero', label: 'Género', type: 'text', required: false, maxLength: 20 },
    ],
  },
  materias: {
    collection: 'materias',
    idField: 'materia_id',
    singular: 'materia',
    title: 'Materias',
    labelField: 'nombre',
    fields: [
      { name: 'nombre', label: 'Nombre', type: 'text', required: true, maxLength: 200 },
      {
        name: 'profesor_id',
        label: 'Profesor',
        type: 'select',
        required: true,
        reference: 'profesores',
      },
      {
        name: 'unidades',
        label: 'Unidades',
        type: 'number',
        required: true,
        min: 1,
        max: 20,
        step: 1,
      },
    ],
  },
  inscripciones: {
    collection: 'inscripciones',
    idField: 'inscripcion_id',
    singular: 'inscripción',
    title: 'Inscripciones',
    labelField: 'periodo',
    fields: [
      { name: 'alumno_id', label: 'Alumno', type: 'select', required: true, reference: 'alumnos' },
      {
        name: 'materia_id',
        label: 'Materia',
        type: 'select',
        required: true,
        reference: 'materias',
      },
      { name: 'periodo', label: 'Periodo', type: 'text', required: true, maxLength: 50 },
    ],
  },
  calificaciones: {
    collection: 'calificaciones',
    idField: 'calificacion_id',
    singular: 'calificación',
    title: 'Calificaciones',
    labelField: 'calificacion',
    fields: [
      {
        name: 'inscripcion_id',
        label: 'Inscripción',
        type: 'select',
        required: true,
        reference: 'inscripciones',
      },
      {
        name: 'alumno_id',
        label: 'Alumno de la inscripción',
        type: 'select',
        required: true,
        reference: 'alumnos',
        readOnly: true,
      },
      {
        name: 'calificacion',
        label: 'Calificación',
        type: 'number',
        required: true,
        min: 0,
        max: 10,
        step: 0.1,
      },
      {
        name: 'parcial',
        label: 'Parcial',
        type: 'number',
        required: true,
        min: 1,
        max: 3,
        step: 1,
      },
    ],
  },
}

export function createEmptyForm(collectionName) {
  return Object.fromEntries(
    collectionSchemas[collectionName].fields.map((field) => [
      field.name,
      field.type === 'number' ? null : '',
    ]),
  )
}

export function normalizeRecord(collectionName, form) {
  return Object.fromEntries(
    collectionSchemas[collectionName].fields.map((field) => {
      const value = form[field.name]
      if (field.type === 'number')
        return [field.name, value === '' || value == null ? null : Number(value)]
      const text = String(value ?? '').trim()
      return [field.name, field.name === 'matricula' ? text.toUpperCase() : text]
    }),
  )
}

export function validateRecord(collectionName, data) {
  for (const field of collectionSchemas[collectionName].fields) {
    const value = data[field.name]
    if (field.required && (value === '' || value == null))
      return `${field.label} es un campo obligatorio.`
    if (field.type === 'number') {
      if (!Number.isFinite(value) || value < field.min || value > field.max)
        return `${field.label} debe estar entre ${field.min} y ${field.max}.`
      if (field.step === 1 && !Number.isInteger(value))
        return `${field.label} debe ser un número entero.`
    } else {
      if (typeof value !== 'string') return `${field.label} debe ser texto.`
      if (field.maxLength && value.length > field.maxLength)
        return `${field.label} admite hasta ${field.maxLength} caracteres.`
      if (field.reference && (value.includes('/') || value.length > 1500))
        return `${field.label} no es válido.`
      if (field.type === 'date' && value) {
        const date = new Date(`${value}T00:00:00Z`)
        if (
          !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
          Number.isNaN(date.getTime()) ||
          date.toISOString().slice(0, 10) !== value
        )
          return `${field.label} no es válida.`
        const today = new Date()
        const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
        if (value > localToday) return 'La fecha de nacimiento no puede ser futura.'
      }
    }
  }
  return ''
}

export function recordLabel(collectionName, data) {
  if (collectionName === 'alumnos') return `${data.nombre} ${data.apellidos} · ${data.matricula}`
  if (collectionName === 'profesores') return `${data.nombre} ${data.apellidos}`
  if (collectionName === 'materias') return data.nombre
  if (collectionName === 'inscripciones') return data.periodo
  return String(data.calificacion ?? '')
}
