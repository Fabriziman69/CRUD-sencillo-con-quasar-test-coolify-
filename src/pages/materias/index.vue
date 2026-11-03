<template><CollectionList :store="store" :schema="collectionSchemas.materias" /></template>
<script setup>
import CollectionList from '@/components/CollectionList.vue'
import { useMateriaStore } from '@/stores/materiaStore'
import { collectionSchemas } from '@/utils/collectionSchemas'
const store = useMateriaStore()
</script>
