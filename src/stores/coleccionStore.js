import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  updateDoc,
  where,
} from 'firebase/firestore'
import { firebasedb } from '@/boot/firebase'
import { useAuthStore } from '@/stores/authStore'
import { firebaseErrorMessage } from '@/utils/firebaseErrors'
import {
  collectionSchemas,
  createEmptyForm,
  normalizeRecord,
  recordLabel,
  validateRecord,
} from '@/utils/collectionSchemas'

const dependencies = {
  alumnos: [
    ['inscripciones', 'alumno_id'],
    ['calificaciones', 'alumno_id'],
  ],
  materias: [['inscripciones', 'materia_id']],
  inscripciones: [['calificaciones', 'inscripcion_id']],
  calificaciones: [],
}

// Consultas preventivas del cliente. Las reglas aplican permisos y validan referencias.
// La unicidad y la eliminación concurrente requieren transacciones de servidor.
export function createCollectionStore(collectionName) {
  const schema = collectionSchemas[collectionName]
  const router = useRouter()
  const authStore = useAuthStore()
  const registros = ref([])
  const formulario = ref(createEmptyForm(collectionName))
  const opciones = ref({})
  const loading = ref(false)
  const saving = ref(false)
  const error = ref('')

  function handleError(cause) {
    error.value = cause?.code
      ? firebaseErrorMessage(cause)
      : cause.message || 'No se pudo completar la operación.'
    return false
  }

  async function getRegistros() {
    loading.value = true
    error.value = ''
    try {
      if (!authStore.canRead)
        throw new Error('Tu cuenta no tiene permiso para consultar estos registros.')
      const snapshot = await getDocs(collection(firebasedb, collectionName))
      registros.value = snapshot.docs.map((item) => ({ ...item.data(), [schema.idField]: item.id }))
      return true
    } catch (cause) {
      registros.value = []
      return handleError(cause)
    } finally {
      loading.value = false
    }
  }

  async function getRegistroByID(id) {
    onReset()
    loading.value = true
    try {
      if (!authStore.canRead)
        throw new Error('Tu cuenta no tiene permiso para consultar este registro.')
      const snapshot = await getDoc(doc(firebasedb, collectionName, String(id)))
      if (!snapshot.exists()) throw new Error('El registro no existe o fue eliminado.')
      formulario.value = {
        ...createEmptyForm(collectionName),
        ...snapshot.data(),
        [schema.idField]: snapshot.id,
      }
      return true
    } catch (cause) {
      return handleError(cause)
    } finally {
      loading.value = false
    }
  }

  async function cargarOpciones() {
    error.value = ''
    try {
      if (!authStore.canRead)
        throw new Error('Tu cuenta no tiene permiso para consultar las opciones.')
      const references = new Set(schema.fields.map((field) => field.reference).filter(Boolean))
      if (references.has('inscripciones')) {
        references.add('alumnos')
        references.add('materias')
      }
      const entries = await Promise.all(
        [...references].map(async (name) => {
          const snapshot = await getDocs(collection(firebasedb, name))
          return [name, snapshot.docs.map((item) => ({ ...item.data(), value: item.id }))]
        }),
      )
      const data = Object.fromEntries(entries)
      const labels = (name, id) => data[name]?.find((item) => item.value === id)
      opciones.value = Object.fromEntries(
        entries.map(([name, items]) => [
          name,
          items
            .filter((item) => name !== 'profesores' || item.nombre)
            .map((item) => ({
              value: item.value,
              label:
                name === 'inscripciones'
                  ? `${labels('alumnos', item.alumno_id) ? recordLabel('alumnos', labels('alumnos', item.alumno_id)) : 'Alumno no disponible'} · ${labels('materias', item.materia_id)?.nombre || 'Materia no disponible'} · ${item.periodo}`
                  : recordLabel(name, item),
              ...(name === 'inscripciones' ? { alumno_id: item.alumno_id } : {}),
            }))
            .sort((a, b) => a.label.localeCompare(b.label, 'es')),
        ]),
      )
      return true
    } catch (cause) {
      opciones.value = {}
      return handleError(cause)
    }
  }

  async function validateReferences(data) {
    for (const field of schema.fields.filter((item) => item.reference && !item.readOnly)) {
      const reference = await getDoc(doc(firebasedb, field.reference, data[field.name]))
      if (!reference.exists())
        throw new Error(`${field.label} ya no existe. Actualiza las opciones.`)
      if (collectionName === 'calificaciones' && field.name === 'inscripcion_id') {
        data.alumno_id = reference.data().alumno_id
        formulario.value.alumno_id = data.alumno_id
      }
    }
  }

  async function validateUnique(data, id) {
    let field
    let same
    let message
    if (collectionName === 'alumnos') {
      field = 'matricula'
      same = () => true
      message = 'Ya existe un alumno con esa matrícula.'
    } else if (collectionName === 'inscripciones') {
      field = 'alumno_id'
      same = (item) =>
        item.materia_id === data.materia_id &&
        item.periodo.toLocaleLowerCase('es') === data.periodo.toLocaleLowerCase('es')
      message = 'El alumno ya está inscrito en esa materia y periodo.'
    } else if (collectionName === 'calificaciones') {
      field = 'inscripcion_id'
      same = (item) => item.parcial === data.parcial
      message = 'Ya existe una calificación para esa inscripción y parcial.'
    } else return
    const matches = await getDocs(
      query(collection(firebasedb, collectionName), where(field, '==', data[field])),
    )
    if (matches.docs.some((item) => item.id !== id && same(item.data()))) throw new Error(message)
  }

  async function guardar(editing) {
    if (saving.value) return false
    error.value = ''
    const id = formulario.value[schema.idField]
    if (!authStore.canCapture || (editing && !id)) {
      error.value = 'Tu cuenta no puede guardar este registro.'
      return false
    }
    saving.value = true
    try {
      const data = normalizeRecord(collectionName, formulario.value)
      // El alumno se obtiene de la inscripción, no de un valor editable independiente.
      if (collectionName === 'calificaciones' && data.inscripcion_id) {
        const inscription = await getDoc(doc(firebasedb, 'inscripciones', data.inscripcion_id))
        if (!inscription.exists()) throw new Error('La inscripción ya no existe.')
        data.alumno_id = inscription.data().alumno_id
      }
      const validation = validateRecord(collectionName, data)
      if (validation) throw new Error(validation)
      await validateReferences(data)
      await validateUnique(data, id)
      if (editing && collectionName === 'inscripciones') {
        const current = await getDoc(doc(firebasedb, collectionName, id))
        if (!current.exists()) throw new Error('La inscripción ya no existe.')
        if (
          current.data().alumno_id !== data.alumno_id ||
          current.data().materia_id !== data.materia_id
        ) {
          const children = await getDocs(
            query(
              collection(firebasedb, 'calificaciones'),
              where('inscripcion_id', '==', id),
              limit(1),
            ),
          )
          if (!children.empty)
            throw new Error(
              'No puedes cambiar el alumno o la materia de una inscripción con calificaciones. Elimina primero sus calificaciones.',
            )
        }
      }
      if (editing) await updateDoc(doc(firebasedb, collectionName, id), data)
      else await addDoc(collection(firebasedb, collectionName), data)
      onReset()
      await router.push(`/${collectionName}`)
      return true
    } catch (cause) {
      return handleError(cause)
    } finally {
      saving.value = false
    }
  }

  async function eliminarRegistro(id) {
    if (saving.value) return false
    error.value = ''
    if (!authStore.isAdmin || !id) {
      error.value = 'Solo un administrador puede eliminar registros.'
      return false
    }
    saving.value = true
    try {
      for (const [dependentCollection, field] of dependencies[collectionName]) {
        const children = await getDocs(
          query(collection(firebasedb, dependentCollection), where(field, '==', id), limit(1)),
        )
        if (!children.empty)
          throw new Error(
            `No puedes eliminar este registro porque tiene ${dependentCollection} relacionadas. Elimínalas primero.`,
          )
      }
      await deleteDoc(doc(firebasedb, collectionName, id))
      registros.value = registros.value.filter((item) => item[schema.idField] !== id)
      onReset()
      return true
    } catch (cause) {
      return handleError(cause)
    } finally {
      saving.value = false
    }
  }

  function onReset() {
    formulario.value = createEmptyForm(collectionName)
    error.value = ''
  }

  return {
    registros,
    formulario,
    opciones,
    loading,
    saving,
    error,
    getRegistros,
    getRegistroByID,
    cargarOpciones,
    crearRegistro: () => guardar(false),
    editarRegistro: () => guardar(true),
    eliminarRegistro,
    onReset,
  }
}
