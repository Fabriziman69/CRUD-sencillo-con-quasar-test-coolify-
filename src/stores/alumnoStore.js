import { acceptHMRUpdate, defineStore } from 'pinia'
import { createCollectionStore } from './coleccionStore'

export const useAlumnoStore = defineStore('alumnoStore', () => {
  const store = createCollectionStore('alumnos')
  return { ...store, alumnos: store.registros, alumnoForm: store.formulario }
})

if (import.meta.hot) import.meta.hot.accept(acceptHMRUpdate(useAlumnoStore, import.meta.hot))
