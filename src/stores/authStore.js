import { acceptHMRUpdate, defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { firebaseAuth, firebasedb } from '@/boot/firebase'
import { firebaseErrorMessage } from '@/utils/firebaseErrors'

export const useAuthStore = defineStore('authStore', () => {
  const user = ref(null)
  const userRole = ref('')
  const error = ref('')
  const loading = ref(false)
  const canRead = computed(() => ['administrador', 'captura', 'consulta'].includes(userRole.value))
  const canCapture = computed(() => ['administrador', 'captura'].includes(userRole.value))
  const isAdmin = computed(() => userRole.value === 'administrador')
  let initialization

  async function refreshProfile(currentUser = firebaseAuth.currentUser) {
    if (!currentUser) {
      user.value = null
      userRole.value = ''
      return false
    }
    try {
      const profile = await getDoc(doc(firebasedb, 'perfiles', currentUser.uid))
      if (firebaseAuth.currentUser?.uid === currentUser.uid) {
        user.value = currentUser
        userRole.value = profile.exists() ? profile.data().rol : 'pendiente'
        error.value = ''
      }
      return true
    } catch (cause) {
      error.value = firebaseErrorMessage(cause)
      return false
    }
  }

  function initialize() {
    if (!initialization) {
      initialization = new Promise((resolve) => {
        onAuthStateChanged(
          firebaseAuth,
          async (currentUser) => {
            user.value = currentUser
            userRole.value = ''
            if (currentUser) await refreshProfile(currentUser)
            resolve()
          },
          (cause) => {
            error.value = firebaseErrorMessage(cause)
            resolve()
          },
        )
      })
    }
    return initialization
  }

  async function authenticate(action) {
    if (loading.value) return false
    loading.value = true
    error.value = ''
    try {
      const credential = await action()
      user.value = credential.user
      return await refreshProfile(credential.user)
    } catch (cause) {
      error.value = firebaseErrorMessage(cause)
      return false
    } finally {
      loading.value = false
    }
  }

  function login(email, password) {
    return authenticate(() => signInWithEmailAndPassword(firebaseAuth, email.trim(), password))
  }

  function register(email, password) {
    return authenticate(async () => {
      const credential = await createUserWithEmailAndPassword(firebaseAuth, email.trim(), password)
      await setDoc(doc(firebasedb, 'perfiles', credential.user.uid), { rol: 'pendiente' })
      return credential
    })
  }

  async function logout() {
    try {
      await signOut(firebaseAuth)
      user.value = null
      userRole.value = ''
      return true
    } catch (cause) {
      error.value = firebaseErrorMessage(cause)
      return false
    }
  }

  return {
    user,
    userRole,
    error,
    loading,
    canRead,
    canCapture,
    isAdmin,
    initialize,
    refreshProfile,
    login,
    register,
    logout,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
}
