<script setup lang="ts">
import VMS from "./components/VMS.vue"
import Sidebar from "./components/Sidebar.vue"
</script>

<template>
  <div class="flex min-h-screen bg-gray-200 text-gray-800">
    <Sidebar class="shrink-0" />
    <VMS class="flex-1 p-8" />
  </div>
</template>
