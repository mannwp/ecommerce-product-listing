<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { useTheme } from 'vuetify'
import { ref } from 'vue'
const theme = useTheme()
const icon = ref('🌞')
function toggleTheme() {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
  icon.value = theme.global.current.value.dark ? '🌞' : '🌙'
}
</script>

<template>
  <div class="h-screen">
    <header class="d-flex pa-4 border-b w-100">
      <span class="w-100 text-h5 font-weight-black text-green">VueCart</span>
      <nav class="d-flex ga-4 w-100 justify-end align-center">
        <RouterLink to="/" class="">Home</RouterLink>
        <RouterLink to="/dashboard" class="">Dashboard</RouterLink>
        <v-btn @click="toggleTheme">{{ icon }}</v-btn>
      </nav>
    </header>
    <main class="w-100 fill-height d-flex justify-center align-start pa-6 pa-sm-12">
      <RouterView />
    </main>
  </div>
</template>
