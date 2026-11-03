import { defineBoot } from '#q-app'
import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { useAuthStore } from '@/stores/authStore'

const firebaseConfig = {
  apiKey: import.meta.env.QCLI_APIKEY,
  authDomain: import.meta.env.QCLI_AUTHDOMAIN,
  projectId: import.meta.env.QCLI_PROJECTID,
  storageBucket: import.meta.env.QCLI_STORAGEBUCKET,
  messagingSenderId: import.meta.env.QCLI_MESSAGINGSENDERID,
  appId: import.meta.env.QCLI_APPID,
}

const missing = ['apiKey', 'authDomain', 'projectId', 'appId'].filter((key) => !firebaseConfig[key])
if (missing.length) {
  throw new Error(`Falta la configuración de Firebase en .env.local: ${missing.join(', ')}`)
}

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig)
export const firebasedb = getFirestore(firebaseApp)
export const firebaseAuth = getAuth(firebaseApp)

export default defineBoot(async () => {
  await useAuthStore().initialize()
})
