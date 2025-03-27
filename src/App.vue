<template>
  <div class="h-screen">
    <Navbar />
    <div class="w-100 d-flex justify-center align-center">
      <router-view />
    </div>
  </div>
</template>
<script setup lang="ts">
import Navbar from './components/Navbar.vue'
</script>
