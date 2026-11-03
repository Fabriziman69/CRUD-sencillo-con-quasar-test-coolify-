import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { initializeApp, deleteApp } from 'firebase/app'
import { collection, getDocs, getFirestore, terminate } from 'firebase/firestore'

// Prueba opcional de solo lectura contra el proyecto configurado en .env.local.
// No inicia sesión, no crea usuarios y no escribe ni elimina documentos.
const enabled = process.env.FIREBASE_SMOKE === '1'
let app
let db

before(() => {
  if (!enabled) return
  process.loadEnvFile('.env.local')
  assert.ok(process.env.QCLI_APIKEY, 'Falta QCLI_APIKEY en .env.local')
  assert.ok(process.env.QCLI_PROJECTID, 'Falta QCLI_PROJECTID en .env.local')
  app = initializeApp(
    {
      apiKey: process.env.QCLI_APIKEY,
      authDomain: process.env.QCLI_AUTHDOMAIN,
      projectId: process.env.QCLI_PROJECTID,
      appId: process.env.QCLI_APPID,
    },
    'curcert-anonymous-access-test',
  )
  db = getFirestore(app)
})

for (const name of [
  'profesores',
  'alumnos',
  'materias',
  'inscripciones',
  'calificaciones',
  'perfiles',
]) {
  test(
    `Firestore rechaza lectura anónima de ${name}`,
    { skip: !enabled, timeout: 20000 },
    async () => {
      await assert.rejects(getDocs(collection(db, name)), { code: 'permission-denied' })
    },
  )
}

after(async () => {
  if (db) await terminate(db)
  if (app) await deleteApp(app)
})
