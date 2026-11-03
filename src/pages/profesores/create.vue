<template>
  <q-page class="justify-center q-pa-sm">
    <q-card class="my-card">
      <q-card-section>
        <div class="text-h6">Crear Profesor</div>
      </q-card-section>
      <q-banner v-if="profesorStore.error" class="bg-red-1 text-negative q-ma-md" role="alert">
        {{ profesorStore.error }}
      </q-banner>

      <q-form
        @submit="profesorStore.onSubmitNewProfesor"
        @reset="profesorStore.onReset"
        class="q-gutter-md"
      >
        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-input
                v-model="profesorStore.profesorForm.nombre"
                maxlength="200"
                :rules="[(val) => !!val?.trim() || 'El nombre es requerido']"
                outlined
                label="Nombre"
              />
            </div>
            <div class="col-6">
              <q-input
                v-model="profesorStore.profesorForm.apellidos"
                maxlength="200"
                :rules="[(val) => !!val?.trim() || 'Los apellidos es requerido']"
                outlined
                label="Apellidos"
              />
            </div>
          </div>
          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-input
                v-model="profesorStore.profesorForm.cedula"
                maxlength="100"
                :rules="[(val) => !!val?.trim() || 'La cedula es requerida']"
                type="text"
                outlined
                label="Cédula"
              />
            </div>
            <div class="col-6">
              <q-input
                v-model="profesorStore.profesorForm.especialidad"
                maxlength="200"
                :rules="[(val) => !!val?.trim() || 'La especialidad es requerida']"
                outlined
                label="Especialidad"
              />
            </div>
          </div>
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-input
                v-model="profesorStore.profesorForm.correo"
                maxlength="320"
                :rules="[(val) => !!val?.trim() || 'El correo es requerido']"
                type="email"
                outlined
                label="Correo electrónico"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-actions vertical align="center">
          <q-btn label="Guardar" type="submit" color="primary" :loading="profesorStore.saving" />
          <q-btn
            label="Limpiar"
            type="reset"
            color="primary"
            flat
            :disable="profesorStore.saving"
          />
          <q-btn label="Cancelar" to="/profesores" flat :disable="profesorStore.saving" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'
import { useProfesorStore } from '@/stores/profesoreStore'
const profesorStore = useProfesorStore()

onMounted(() => {
  profesorStore.onReset()
})
</script>
