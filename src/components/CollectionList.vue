<template>
  <q-page class="q-pa-md">
    <q-card flat bordered>
      <q-card-section class="row items-center q-gutter-sm">
        <h1 class="text-h5 q-my-none">{{ schema.title }}</h1>
        <q-space />
        <q-btn flat icon="refresh" label="Actualizar" :loading="busy" @click="load" />
        <q-btn
          v-if="authStore.canCapture"
          color="primary"
          icon="add"
          label="Agregar"
          :to="`/${schema.collection}/create`"
        />
      </q-card-section>
      <q-card-section>
        <q-banner v-if="store.error" class="bg-red-1 text-negative q-mb-md" role="alert">{{
          store.error
        }}</q-banner>
        <q-input
          v-model="search"
          outlined
          dense
          clearable
          label="Buscar registros"
          class="q-mb-md"
          style="max-width: 420px"
        >
          <template #prepend><q-icon name="search" /></template>
        </q-input>
        <q-table
          :rows="store.registros"
          :columns="columns"
          :row-key="schema.idField"
          :filter="search"
          :loading="busy"
          :rows-per-page-options="[10, 25, 50]"
          no-data-label="No hay registros"
          no-results-label="No hay coincidencias"
          rows-per-page-label="Registros por página"
        >
          <template #body-cell-acciones="props">
            <q-td :props="props" class="text-center">
              <q-btn
                v-if="authStore.canCapture"
                flat
                round
                color="primary"
                icon="edit"
                aria-label="Editar registro"
                :to="`/${schema.collection}/edit_${props.row[schema.idField]}`"
              />
              <q-btn
                v-if="authStore.isAdmin"
                flat
                round
                color="negative"
                icon="delete"
                aria-label="Eliminar registro"
                @click="askDelete(props.row)"
              />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
    <q-dialog v-model="confirm" persistent>
      <q-card style="width: 460px; max-width: 95vw">
        <q-card-section><h2 class="text-h6 q-my-none">Eliminar registro</h2></q-card-section>
        <q-card-section class="q-pt-none">
          <p>{{ deleteLabel }}</p>
          <p>Esta acción es definitiva. Escribe <strong>ELIMINAR</strong> para confirmar.</p>
          <q-input v-model="validateCode" outlined label="Confirmación" :disable="store.saving" />
          <q-banner v-if="store.error" class="bg-red-1 text-negative q-mt-md" role="alert">{{
            store.error
          }}</q-banner>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" :disable="store.saving" v-close-popup />
          <q-btn
            label="Eliminar"
            color="negative"
            :disable="validateCode !== 'ELIMINAR'"
            :loading="store.saving"
            @click="remove"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/authStore'
import { recordLabel } from '@/utils/collectionSchemas'
const props = defineProps({
  store: { type: Object, required: true },
  schema: { type: Object, required: true },
})
const authStore = useAuthStore()
const { error } = storeToRefs(props.store)
const search = ref('')
const busy = ref(false)
const confirm = ref(false)
const validateCode = ref('')
const deleteId = ref('')
const deleteLabel = ref('')
const columns = computed(() => [
  ...props.schema.fields.map((field) => ({
    name: field.name,
    label: field.label,
    align: 'left',
    sortable: true,
    field: (row) =>
      field.reference
        ? props.store.opciones[field.reference]?.find((option) => option.value === row[field.name])
            ?.label ||
          row[field.name] ||
          '—'
        : row[field.name] === ''
          ? '—'
          : row[field.name],
  })),
  { name: 'acciones', label: 'Acciones', align: 'center' },
])
async function load() {
  busy.value = true
  try {
    if (await props.store.getRegistros()) await props.store.cargarOpciones()
  } finally {
    busy.value = false
  }
}
function askDelete(row) {
  deleteId.value = row[props.schema.idField]
  deleteLabel.value =
    props.schema.collection === 'inscripciones'
      ? [
          optionLabel('alumnos', row.alumno_id),
          optionLabel('materias', row.materia_id),
          row.periodo,
        ].join(' · ')
      : props.schema.collection === 'calificaciones'
        ? `${optionLabel('inscripciones', row.inscripcion_id)} · Parcial ${row.parcial} · Calificación ${row.calificacion}`
        : recordLabel(props.schema.collection, row)
  validateCode.value = ''
  error.value = ''
  confirm.value = true
}
async function remove() {
  if (await props.store.eliminarRegistro(deleteId.value)) confirm.value = false
}
function optionLabel(collection, id) {
  return props.store.opciones[collection]?.find((item) => item.value === id)?.label || id
}
onMounted(load)
</script>
