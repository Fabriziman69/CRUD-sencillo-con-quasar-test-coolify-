<template><CollectionList :store="store" :schema="collectionSchemas.calificaciones" /></template>
<script setup>
import CollectionList from '@/components/CollectionList.vue'
import { useCalificacionStore } from '@/stores/calificacionStore'
import { collectionSchemas } from '@/utils/collectionSchemas'
const store = useCalificacionStore()
</script>
