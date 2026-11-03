<template><CollectionForm :store="store" :schema="collectionSchemas.inscripciones" /></template>
<script setup>
import CollectionForm from '@/components/CollectionForm.vue'
import { useInscripcionStore } from '@/stores/inscripcionStore'
import { collectionSchemas } from '@/utils/collectionSchemas'
const store = useInscripcionStore()
</script>
