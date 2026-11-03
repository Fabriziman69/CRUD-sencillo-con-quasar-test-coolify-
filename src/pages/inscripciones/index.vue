<template><CollectionList :store="store" :schema="collectionSchemas.inscripciones" /></template>
<script setup>
import CollectionList from '@/components/CollectionList.vue'
import { useInscripcionStore } from '@/stores/inscripcionStore'
import { collectionSchemas } from '@/utils/collectionSchemas'
const store = useInscripcionStore()
</script>
