<template>
  <q-page class="q-pa-lg">
    <h1 class="text-h4 q-mt-none q-mb-sm">Gestión escolar Curcert</h1>
    <p class="text-body1">Administra los registros escolares desde cada módulo.</p>
    <q-banner v-if="!authStore.user" class="bg-blue-1 q-mb-lg"
      >Inicia sesión para consultar o administrar los registros.</q-banner
    >
    <q-banner v-else-if="!authStore.canRead" class="bg-amber-1 q-mb-lg"
      >Tu cuenta está pendiente de autorización.
      <router-link to="/acceso">Comprobar acceso</router-link></q-banner
    >
    <div class="row q-col-gutter-md">
      <div v-for="item in modules" :key="item.path" class="col-12 col-sm-6 col-lg-4">
        <q-card flat bordered class="full-height">
          <q-card-section>
            <q-icon :name="item.icon" color="primary" size="32px" />
            <h2 class="text-h6 q-my-sm">{{ item.title }}</h2>
            <p class="q-mb-none">{{ item.description }}</p>
          </q-card-section>
          <q-card-actions
            ><q-btn
              flat
              color="primary"
              :label="`Abrir ${item.title.toLowerCase()}`"
              :to="item.path"
          /></q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>
<script setup>
import { useAuthStore } from '@/stores/authStore'
const authStore = useAuthStore()
const modules = [
  {
    path: '/profesores',
    title: 'Profesores',
    icon: 'school',
    description: 'Datos de contacto y especialidad de los docentes.',
  },
  {
    path: '/alumnos',
    title: 'Alumnos',
    icon: 'groups',
    description: 'Datos personales y matrícula de cada alumno.',
  },
  {
    path: '/materias',
    title: 'Materias',
    icon: 'menu_book',
    description: 'Asignaturas, unidades y profesor responsable.',
  },
  {
    path: '/inscripciones',
    title: 'Inscripciones',
    icon: 'assignment',
    description: 'Alumnos inscritos en cada materia y periodo.',
  },
  {
    path: '/calificaciones',
    title: 'Calificaciones',
    icon: 'grading',
    description: 'Evaluaciones por inscripción y parcial.',
  },
]
</script>
