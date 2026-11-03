import { acceptHMRUpdate, defineStore } from 'pinia'
import { createCollectionStore } from './coleccionStore'

export const useCalificacionStore = defineStore('calificacionStore', () => {
  const store = createCollectionStore('calificaciones')
  return { ...store, calificaciones: store.registros, calificacionForm: store.formulario }
})

if (import.meta.hot) import.meta.hot.accept(acceptHMRUpdate(useCalificacionStore, import.meta.hot))
