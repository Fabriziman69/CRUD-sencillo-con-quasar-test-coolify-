import { acceptHMRUpdate, defineStore } from 'pinia'
import { createCollectionStore } from './coleccionStore'

export const useMateriaStore = defineStore('materiaStore', () => {
  const store = createCollectionStore('materias')
  return { ...store, materias: store.registros, materiaForm: store.formulario }
})

if (import.meta.hot) import.meta.hot.accept(acceptHMRUpdate(useMateriaStore, import.meta.hot))
