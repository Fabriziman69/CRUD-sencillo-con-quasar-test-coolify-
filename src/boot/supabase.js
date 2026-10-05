import { defineBoot } from '#q-app'

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.QCLI_VITE_SUPABASE_URL
const supabaseKey = import.meta.env.QCLI_VITE_SUPABASE_PUBLISHABLE_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli-vite/boot-files
export default defineBoot(async (/* { app, router, ... } */) => {
  // something to do
})
