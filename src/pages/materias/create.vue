<template><CollectionForm :store="store" :schema="collectionSchemas.materias" /></template>
<script setup>
import CollectionForm from '@/components/CollectionForm.vue'
import { useMateriaStore } from '@/stores/materiaStore'
import { collectionSchemas } from '@/utils/collectionSchemas'
const store = useMateriaStore()
</script>
