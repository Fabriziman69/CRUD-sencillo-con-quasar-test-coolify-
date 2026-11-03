import { acceptHMRUpdate, defineStore } from 'pinia'
import { createCollectionStore } from './coleccionStore'

export const useInscripcionStore = defineStore('inscripcionStore', () => {
  const store = createCollectionStore('inscripciones')
  return { ...store, inscripciones: store.registros, inscripcionForm: store.formulario }
})

if (import.meta.hot) import.meta.hot.accept(acceptHMRUpdate(useInscripcionStore, import.meta.hot))
