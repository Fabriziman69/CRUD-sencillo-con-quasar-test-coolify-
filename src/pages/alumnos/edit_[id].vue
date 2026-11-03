<template><CollectionForm :store="store" :schema="collectionSchemas.alumnos" editing /></template>
<script setup>
import CollectionForm from '@/components/CollectionForm.vue'
import { useAlumnoStore } from '@/stores/alumnoStore'
import { collectionSchemas } from '@/utils/collectionSchemas'
const store = useAlumnoStore()
</script>
