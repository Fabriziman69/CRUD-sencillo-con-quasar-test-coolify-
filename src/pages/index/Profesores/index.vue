<template>
  <q-page class="justify-center q-pa-sm">
    <q-card class="my-card">
      <q-card-section class="row">
        <div class="text-h6">Lista de Profesores</div>
        <q-space />
        <q-btn v-if="userRole === 'administrador' || userRole === 'captura'" color="positive" icon="add" label="Agregar" to="/profesores/create" />
      </q-card-section>

      <q-card-section>
        <q-table :rows="profesorStore.profesores" :columns="columns" row-key="name">
          <template v-slot:body-cell-acciones="props">
            <q-td key="acciones" :props="props">
              <q-btn-group flat>
                <q-btn
                  v-if="userRole === 'administrador' || userRole === 'captura'"
                  color="primary"
                  icon="edit"
                  dense
                  flat
                  size="sm"
                  :to="'/profesores/edit_' + props.row.profesor_id"
                />
                <q-btn
                  v-if="userRole === 'administrador'"
                  color="negative"
                  icon="delete"
                  dense
                  flat
                  size="sm"
                  @click="setDelete(props.row)"
                />
              </q-btn-group>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <q-dialog v-model="confirm" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="danger" color="negative" text-color="white" />
          <span class="q-ml-sm">¡Alerta! Eliminar <q-chip square :label="deleteItem" /></span>
        </q-card-section>
        <q-card-section>
          Para eliminar el rigistro favor de ingresar
          <q-chip square :label="deleteCode" />
          para confiramar.
        </q-card-section>
        <q-card-section>
          <q-input v-model="validateCode" type="text" label="" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn
            :disable="validateCode != deleteCode"
            label="Eliminar"
            color="negative"
            @click="profesorStore.deleteProfesor"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'
import { useProfesorStore } from '@/stores/profesoreStore'
import { ref } from 'vue'
import { supabase } from '@/boot/supabase'

const profesorStore = useProfesorStore()
const userRole = ref('')

onMounted(async () => {
  profesorStore.getProfesores()

  // Obtener el rol del usuario autenticado
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data } = await supabase.from('perfiles').select('rol').eq('id', user.id).single()
    if (data) {
      userRole.value = data.rol
    }
  }
})

const columns = [
  {
    name: 'profesor_id',
    label: 'ID',
    field: (row) => row.profesor_id,
    align: 'left',
    required: true,
    format: (val) => `${val}`,
    sortable: true,
  },
  {
    name: 'nombre',
    label: 'Nombre',
    field: (row) => row.nombre,
    align: 'left',
    required: true,
    format: (val) => `${val}`,
    sortable: true,
  },
  {
    name: 'apellidos',
    label: 'Apellidos',
    field: (row) => row.apellidos,
    align: 'left',
    required: true,
    format: (val) => `${val}`,
    sortable: true,
  },
  {
    name: 'cedula',
    label: 'Cedula Profesional',
    field: (row) => row.cedula,
    align: 'left',
    required: false,
    format: (val) => `${val}`,
    sortable: false,
  },
  {
    name: 'especialidad',
    label: 'Especialidad',
    field: (row) => row.especialidad,
    align: 'left',
    required: false,
    format: (val) => `${val}`,
    sortable: true,
  },
  {
    name: 'correo',
    label: 'Correo',
    field: (row) => row.correo,
    align: 'left',
    required: false,
    format: (val) => `${val}`,
    sortable: true,
  },
  {
    name: 'acciones',
    label: 'Acciones',
    align: 'center',
    sortable: false,
  },
]

const deleteItem = ref('')
const deleteCode = ref('')
const validateCode = ref('')
const confirm = ref(false)
function setDelete(profesor) {
  deleteItem.value = profesor.nombre
  deleteCode.value = profesor.profesor_id
  confirm.value = true
  profesorStore.profesorForm = Object.assign({}, profesor)
}
</script>
