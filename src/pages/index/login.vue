<template>
  <q-page class="flex flex-center">
    <q-card class="my-card">
      <q-form @submit="login">
        <q-card-section>
          <div class="text-h6">Login</div>
        </q-card-section>
        <q-card-section class="row">
          <q-input v-model="user" type="text" label="Usuario" />
        </q-card-section>
        <q-card-section class="row">
          <q-input v-model="password" type="password" label="Contraseña" />
        </q-card-section>
        <q-card-actions align="center">
          <q-btn type="submit" label="Iniciar sesión" />
          <q-btn flat label="Regitrarse" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '@/boot/supabase'
import { useRouter } from 'vue-router'

const user = ref('')
const password = ref('')
const router = useRouter()

async function login() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: user.value,
    password: password.value,
  })
  if (error) {
    console.error(error)
  } else {
    console.log(data)
    router.push('/')
  }
}
</script>

<style lang="scss" scoped></style>
