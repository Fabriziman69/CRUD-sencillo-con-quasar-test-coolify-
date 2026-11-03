<template>
  <q-page class="flex flex-center q-pa-md">
    <q-card style="width: 380px; max-width: 100%">
      <q-form @submit="login">
        <q-card-section>
          <div class="text-h6">{{ registering ? 'Crear cuenta' : 'Iniciar sesión' }}</div>
          <div class="text-caption">Curcert</div>
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <q-banner v-if="authStore.error" class="bg-red-1 text-negative" role="alert">
            {{ authStore.error }}
          </q-banner>
          <q-input
            v-model="user"
            type="email"
            label="Correo electrónico"
            autocomplete="email"
            :rules="[(val) => !!val?.trim() || 'Ingresa tu correo']"
            outlined
          />
          <q-input
            v-model="password"
            type="password"
            label="Contraseña"
            :autocomplete="registering ? 'new-password' : 'current-password'"
            :rules="[
              (val) => !!val || 'Ingresa tu contraseña',
              (val) => !registering || val.length >= 6 || 'Usa al menos seis caracteres',
            ]"
            outlined
          />
          <div v-if="registering" class="text-caption">
            Un administrador debe asignar un rol a tu cuenta para acceder a los módulos.
          </div>
        </q-card-section>
        <q-card-actions vertical class="q-pa-md q-gutter-sm">
          <q-btn
            type="submit"
            color="primary"
            :loading="authStore.loading"
            :label="registering ? 'Crear cuenta' : 'Iniciar sesión'"
          />
          <q-btn
            flat
            :disable="authStore.loading"
            :label="registering ? 'Ya tengo cuenta' : 'Registrarse'"
            @click="toggleRegistration"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const user = ref('')
const password = ref('')
const registering = ref(false)
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

function toggleRegistration() {
  registering.value = !registering.value
  authStore.error = ''
}

async function openAccount() {
  const redirect =
    typeof route.query.redirect === 'string' &&
    /^\/(profesores|alumnos|materias|inscripciones|calificaciones)(\/|$)/.test(route.query.redirect)
      ? route.query.redirect
      : '/'
  await router.replace(authStore.canRead ? redirect : '/acceso')
}

async function login() {
  const success = registering.value
    ? await authStore.register(user.value, password.value)
    : await authStore.login(user.value, password.value)
  if (success) {
    password.value = ''
    await openAccount()
  }
}
</script>
