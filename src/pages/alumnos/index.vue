<template><CollectionList :store="store" :schema="collectionSchemas.alumnos" /></template>
<script setup>
import CollectionList from '@/components/CollectionList.vue'
import { useAlumnoStore } from '@/stores/alumnoStore'
import { collectionSchemas } from '@/utils/collectionSchemas'
const store = useAlumnoStore()
</script>
