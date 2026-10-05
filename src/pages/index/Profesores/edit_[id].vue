<template>
  <q-page class="justify-center q-pa-sm">
    <q-card class="my-card">
      <img src="https://cdn.quasar.dev/img/mountains.jpg" />
      <q-form
        @submit="profesorStore.onSubmiteditProfesor"
        @reset="profesorStore.onReset"
        class="q-gutter-md"
      >
        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-input
                v-model="profesorStore.profesorForm.nombre"
                :rules="[(val) => !!val || 'El nombre es requerido']"
                outlined
                label="Nombre"
              />
            </div>
            <div class="col-6">
              <q-input
                v-model="profesorStore.profesorForm.apellidos"
                :rules="[(val) => !!val || 'Los apellidos es requerido']"
                outlined
                label="Apellidos"
              />
            </div>
          </div>
          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-input
                v-model="profesorStore.profesorForm.cedula"
                :rules="[(val) => !!val || 'La cedula es requerida']"
                type="text"
                outlined
                label="Cédula"
              />
            </div>
            <div class="col-6">
              <q-input
                v-model="profesorStore.profesorForm.especialidad"
                :rules="[(val) => !!val || 'La especialidad es requerida']"
                outlined
                label="Especialidad"
              />
            </div>
          </div>
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-input
                v-model="profesorStore.profesorForm.correo"
                :rules="[(val) => !!val || 'El correo es requerido']"
                type="email"
                outlined
                label="Correo electrónico"
              />
            </div>
          </div>
        </q-card-section>

        <div>
          <q-btn label="Submit" type="submit" color="primary" />
          <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
        </div>
      </q-form>
    </q-card>
  </q-page>
  <div></div>
</template>

<script setup>
import { useProfesorStore } from '@/stores/profesoreStore'
import { useRoute } from 'vue-router'
import { onMounted } from 'vue'
const profesorStore = useProfesorStore()
const route = useRoute()

onMounted(() => {
  const id = route.params.id
  profesorStore.getProfesoresByID(id)
})
</script>

<style lang="scss" scoped></style>
