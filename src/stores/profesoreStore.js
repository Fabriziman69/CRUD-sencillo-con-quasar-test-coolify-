import { defineStore, acceptHMRUpdate } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/boot/supabase'
import { useRouter } from 'vue-router'

export const useProfesorStore = defineStore('profesorStore', () => {
  const router = useRouter()
  //STATE
  const profesores = ref([])

  const profesorForBase = {
    nombre: '',
    apellidos: '',
    cedula: '',
    especialidad: '',
    correo: '',
  }

  const profesorForm = ref({ ...profesorForBase })

  //ACTIONS
  async function getProfesores() {
    const { data, error } = await supabase.from('profesor').select()
    if (error) {
      console.log(error)
      return
    }
    profesorForm.value = Object.assign({}, profesorForBase)
    profesores.value = data
    router.push('/profesores')
  }

  async function getProfesoresByID(id) {
    const { data, error } = await supabase.from('profesor').select().eq('profesor_id', id)

    if (error) {
      console.log(error)
      return
    }
    profesores.value = data
  }

  async function onSubmiteditProfesor() {
    const { error } = await supabase
      .from('profesor')
      .update(profesorForm.value)
      .eq('profesor_id', profesorForm.value.profesor_id)
      .select()

    if (error) {
      console.log(error)
      return
    }
    await getProfesores()
    onReset()
  }

  async function onSubmitNewProfesor() {
    const { error } = await supabase.from('profesor').insert(profesorForm.value)

    if (error) {
      console.log(error)
      return
    }
    await getProfesores()
    onReset()
  }

  async function deleteProfesor() {
    const { error } = await supabase
      .from('profesor')
      .delete()
      .eq('profesor_id', profesorForm.value.profesor_id)
    if (error == null) {
      profesores.value = profesores.value.filter(
        (v) => v.profesor_id != profesorForm.value.profesor_id,
      )
      profesorForm.value = Object.assign({}, profesorForm)
      router.push('/profesores')
    }
  }

  function onReset() {
    profesorForm.value = { ...profesorForBase }
  }

  //RETURN
  return {
    profesores,
    profesorForm,
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
