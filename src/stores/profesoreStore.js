import { defineStore, acceptHMRUpdate } from 'pinia'
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

export const useProfesorStore = defineStore('profesorStore', () => {
  const router = useRouter()
  const profesores = ref([])
  const loading = ref(false)
  const saving = ref(false)
  const error = ref('')
  const authStore = useAuthStore()

  const profesorForBase = {
    nombre: '',
    apellidos: '',
    cedula: '',
    especialidad: '',
    correo: '',
  }
  const profesorForm = ref({ ...profesorForBase })

  async function getProfesores() {
    loading.value = true
    error.value = ''
    try {
      const data = await getDocs(collection(firebasedb, 'profesores'))
      profesores.value = data.docs
        .filter((profesor) => Object.keys(profesorForBase).some((key) => key in profesor.data()))
        .map((profesor) => ({
          ...profesorForBase,
          ...profesor.data(),
          profesor_id: profesor.id,
        }))
      return true
    } catch (cause) {
      profesores.value = []
      error.value = firebaseErrorMessage(cause)
      return false
    } finally {
      loading.value = false
    }
  }

  async function getProfesoresByID(id) {
    onReset()
    loading.value = true
    error.value = ''
    try {
      const data = await getDoc(doc(firebasedb, 'profesores', String(id)))
      if (!data.exists()) {
        error.value = 'El profesor no existe o fue eliminado.'
        return false
      }
      profesorForm.value = { ...profesorForBase, ...data.data(), profesor_id: data.id }
      return true
    } catch (cause) {
      error.value = firebaseErrorMessage(cause)
      return false
    } finally {
      loading.value = false
    }
  }

  function profesorData() {
    return Object.fromEntries(
      Object.keys(profesorForBase).map((key) => [
        key,
        String(profesorForm.value[key] ?? '').trim(),
      ]),
    )
  }

  async function onSubmiteditProfesor() {
    if (saving.value) return false
    if (!authStore.canCapture || !profesorForm.value.profesor_id) {
      error.value = 'No puedes editar este profesor.'
      return false
    }
    saving.value = true
    error.value = ''
    try {
      await updateDoc(doc(firebasedb, 'profesores', profesorForm.value.profesor_id), profesorData())
      onReset()
      await router.push('/profesores')
      return true
    } catch (cause) {
      error.value = firebaseErrorMessage(cause)
      return false
    } finally {
      saving.value = false
    }
  }

  async function onSubmitNewProfesor() {
    if (saving.value) return false
    if (!authStore.canCapture) {
      error.value = 'Tu cuenta no tiene permiso para agregar profesores.'
      return false
    }
    saving.value = true
    error.value = ''
    try {
      await addDoc(collection(firebasedb, 'profesores'), profesorData())
      onReset()
      await router.push('/profesores')
      return true
    } catch (cause) {
      error.value = firebaseErrorMessage(cause)
      return false
    } finally {
      saving.value = false
    }
  }

  async function deleteProfesor() {
    if (saving.value) return false
    if (!authStore.isAdmin || !profesorForm.value.profesor_id) {
      error.value = 'Solo un administrador puede eliminar profesores.'
      return false
    }
    saving.value = true
    error.value = ''
    try {
      const id = profesorForm.value.profesor_id
      const materias = await getDocs(
        query(collection(firebasedb, 'materias'), where('profesor_id', '==', id), limit(1)),
      )
      if (!materias.empty) {
        error.value =
          'No puedes eliminar este profesor porque tiene materias relacionadas. Elimina primero sus materias.'
        return false
      }
      await deleteDoc(doc(firebasedb, 'profesores', id))
      profesores.value = profesores.value.filter((profesor) => profesor.profesor_id !== id)
      onReset()
      return true
    } catch (cause) {
      error.value = firebaseErrorMessage(cause)
      return false
    } finally {
      saving.value = false
    }
  }

  function onReset() {
    profesorForm.value = { ...profesorForBase }
    error.value = ''
  }

  return {
    profesores,
    profesorForm,
    loading,
    saving,
    error,
    getProfesores,
    getProfesoresByID,
    onSubmitNewProfesor,
    onSubmiteditProfesor,
    onReset,
    deleteProfesor,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useProfesorStore, import.meta.hot))
}
