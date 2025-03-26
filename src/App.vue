<script setup lang="ts">
// import { RouterLink, RouterView } from 'vue-router'
import { useTheme } from 'vuetify'
import { ref, watch } from 'vue'
import { switchLanguage } from './i18n'
const theme = useTheme()
const icon = ref('🌞')
function toggleTheme() {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
  icon.value = theme.global.current.value.dark ? '🌞' : '🌙'
}
// const languageOptions = ['en', 'fr']
const languageOptions = [
  { title: 'English', value: 'en' },
  { title: 'Français', value: 'fr' },
  { title: 'العربية', value: 'ar' },
]
const currentLanguage = ref('en') // Default language
watch(currentLanguage, (newLang) => {
  switchLanguage(newLang as 'en' | 'fr' | 'ar')
})
</script>

<template>
  <div class="h-screen">
    <header
      class="d-flex pa-2 px-md-12 py-md-2 flex-column flex-sm-row align-center border-b w-100"
    >
      <span class="w-100 text-h5 font-weight-black text-green">VueCart</span>
      <nav class="d-flex ga-4 w-100 justify-end flex-column flex-sm-row align-center">
        <div class="d-flex justify-center align-center">
          <v-btn :to="{ name: 'home' }" variant="text">{{ $t('home') }}</v-btn>
          <v-btn :to="{ name: 'dashboard' }" variant="text">{{ $t('dashboard') }}</v-btn>
        </div>
        <div class="d-flex ga-4 justify-center align-center">
          <v-select
            v-model="currentLanguage"
            :items="languageOptions"
            item-title="title"
            item-value="value"
            label="Language"
            style="width: 150px"
            class="ma-0 pa-0"
          />
          <v-btn @click="toggleTheme">{{ icon }}</v-btn>
        </div>
      </nav>
    </header>
    <div class="w-100 d-flex justify-center align-center">
      <router-view />
    </div>
  </div>
</template>
