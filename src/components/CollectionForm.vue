<template>
  <q-page class="q-pa-md">
    <q-card flat bordered style="max-width: 900px; margin: 0 auto">
      <q-card-section
        ><h1 class="text-h5 q-my-none">
          {{ editing ? 'Editar' : 'Crear' }} {{ schema.singular }}
        </h1></q-card-section
      >
      <q-linear-progress v-if="busy" indeterminate />
      <q-card-section>
        <q-banner v-if="store.error" class="bg-red-1 text-negative q-mb-md" role="alert">{{
          store.error
        }}</q-banner>
        <q-btn v-if="!ready && !busy" flat color="primary" label="Reintentar" @click="load" />
        <q-form v-if="ready" ref="formRef" @submit="save" @reset="reset">
          <div class="row q-col-gutter-md">
            <div v-for="field in schema.fields" :key="field.name" class="col-12 col-sm-6">
              <q-select
                v-if="field.reference"
                v-model="formulario[field.name]"
                :label="field.label"
                :options="store.opciones[field.reference] || []"
                emit-value
                map-options
                outlined
                :readonly="field.readOnly"
                :disable="store.saving"
                :rules="rules(field)"
                :hint="field.readOnly ? 'Se obtiene de la inscripción seleccionada' : undefined"
                @update:model-value="referenceChanged(field)"
              >
                <template #no-option
                  ><q-item
                    ><q-item-section>No hay opciones disponibles</q-item-section></q-item
                  ></template
                >
              </q-select>
              <q-input
                v-else
                v-model="formulario[field.name]"
                :type="field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'"
                :label="field.label"
                :maxlength="field.maxLength"
                :min="field.min"
                :max="field.max"
                :step="field.step || (field.type === 'number' ? 1 : undefined)"
                :rules="rules(field)"
                :disable="store.saving"
                :readonly="field.readOnly"
                outlined
                :hint="!field.required ? 'Opcional' : undefined"
              />
              <div
                v-if="
                  field.reference && !field.readOnly && !store.opciones[field.reference]?.length
                "
                class="text-caption q-mb-md"
              >
                Registra primero un elemento en
                <router-link :to="`/${field.reference}/create`">{{ field.reference }}</router-link
                >.
              </div>
            </div>
          </div>
          <q-card-actions align="right" class="q-px-none q-mt-md">
            <q-btn flat label="Cancelar" :to="`/${schema.collection}`" :disable="store.saving" />
            <q-btn
              flat
              :label="editing ? 'Restablecer' : 'Limpiar'"
              type="reset"
              :disable="store.saving"
            />
            <q-btn label="Guardar" color="primary" type="submit" :loading="store.saving" />
          </q-card-actions>
        </q-form>
        <q-btn v-else flat label="Volver a la lista" :to="`/${schema.collection}`" />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
const props = defineProps({
  store: { type: Object, required: true },
  schema: { type: Object, required: true },
  editing: Boolean,
})
const route = useRoute()
const { formulario } = storeToRefs(props.store)
const formRef = ref(null)
const busy = ref(false)
const ready = ref(false)
const recordId = computed(() => String(route.params.id || ''))
function rules(field) {
  return [
    (value) => {
      const empty = value === null || value === undefined || String(value).trim() === ''
      if (empty) return !field.required || `Completa ${field.label.toLowerCase()}`
      if (field.type === 'number') {
        const number = Number(value)
        if (!Number.isFinite(number) || number < field.min || number > field.max)
          return `Usa un valor de ${field.min} a ${field.max}`
        if ((!field.step || field.step === 1) && !Number.isInteger(number))
          return 'Usa un número entero'
      }
      return true
    },
  ]
}
function referenceChanged(field) {
  if (props.schema.collection === 'calificaciones' && field.name === 'inscripcion_id') {
    formulario.value.alumno_id =
      props.store.opciones.inscripciones?.find(
        (item) => item.value === props.store.formulario.inscripcion_id,
      )?.alumno_id || ''
  }
}
async function load() {
  busy.value = true
  ready.value = false
  props.store.onReset()
  try {
    if (!(await props.store.cargarOpciones())) return
    ready.value = !props.editing || (await props.store.getRegistroByID(recordId.value))
  } finally {
    busy.value = false
  }
}
async function reset() {
  if (props.editing) await load()
  else props.store.onReset()
  await nextTick()
  formRef.value?.resetValidation()
}
async function save() {
  if (props.editing) await props.store.editarRegistro()
  else await props.store.crearRegistro()
}
watch(recordId, load, { immediate: true })
</script>
