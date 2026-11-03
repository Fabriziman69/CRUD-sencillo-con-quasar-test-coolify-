<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menú" @click="toggleLeftDrawer" />
        <q-toolbar-title>Curcert</q-toolbar-title>
        <q-btn v-if="authStore.user" flat label="Cerrar sesión" icon="logout" @click="logout" />
        <q-btn v-else flat label="Iniciar sesión" to="/login" />
      </q-toolbar>
    </q-header>
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header>Navegación</q-item-label>
        <q-item v-for="link in linksList" :key="link.label" clickable :to="link.to" exact>
          <q-item-section avatar><q-icon :name="link.icon" /></q-item-section>
          <q-item-section>{{ link.label }}</q-item-section>
        </q-item>
        <q-separator class="q-my-md" />
        <q-item v-if="authStore.user">
          <q-item-section>
            <q-item-label style="overflow-wrap: anywhere">{{ authStore.user.email }}</q-item-label>
            <q-item-label caption>{{ authStore.userRole || 'Sin rol asignado' }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>
    <q-page-container><router-view /></q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
const router = useRouter()
const authStore = useAuthStore()
const linksList = [
  { label: 'Inicio', icon: 'home', to: '/' },
  { label: 'Profesores', icon: 'school', to: '/profesores' },
  { label: 'Alumnos', icon: 'groups', to: '/alumnos' },
  { label: 'Materias', icon: 'menu_book', to: '/materias' },
  { label: 'Inscripciones', icon: 'assignment', to: '/inscripciones' },
  { label: 'Calificaciones', icon: 'grading', to: '/calificaciones' },
]
const leftDrawerOpen = ref(false)
function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
async function logout() {
  if (await authStore.logout()) await router.replace('/login')
}
</script>
