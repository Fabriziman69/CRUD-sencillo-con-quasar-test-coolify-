<template>
  <q-page class="flex flex-center q-pa-md">
    <q-card style="max-width: 540px">
      <q-card-section>
        <div class="text-h6">Cuenta pendiente de autorización</div>
        <p class="q-mt-md">
          Tu sesión está iniciada. Un administrador debe asignarte un rol para acceder a los
          profesores.
        </p>
        <div class="text-caption">Identificador de tu cuenta</div>
        <code style="overflow-wrap: anywhere">{{ authStore.user?.uid }}</code>
        <q-banner v-if="authStore.error" class="bg-red-1 text-negative q-mt-md" role="alert">{{
          authStore.error
        }}</q-banner>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn color="primary" label="Comprobar acceso" :loading="checking" @click="checkAccess" />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
const authStore = useAuthStore()
const router = useRouter()
const checking = ref(false)
async function checkAccess() {
  checking.value = true
  await authStore.refreshProfile()
  checking.value = false
  if (authStore.canRead) await router.replace('/profesores')
}
</script>
