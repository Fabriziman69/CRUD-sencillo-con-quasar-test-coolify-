<template>
  <CollectionForm :store="store" :schema="collectionSchemas.calificaciones" editing />
</template>
<script setup>
import CollectionForm from '@/components/CollectionForm.vue'
import { useCalificacionStore } from '@/stores/calificacionStore'
import { collectionSchemas } from '@/utils/collectionSchemas'
const store = useCalificacionStore()
</script>
