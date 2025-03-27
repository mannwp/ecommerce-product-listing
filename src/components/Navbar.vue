<template>
  <header class="d-flex pa-2 px-md-12 py-md-2 flex-column flex-sm-row align-center border-b w-100">
    <span class="w-100 text-h5 font-weight-black text-green">VueCart</span>
    <nav class="d-flex ga-4 w-100 justify-end flex-column flex-sm-row align-end">
      <div class="d-flex justify-center align-center">
        <v-btn :to="{ name: 'home' }" variant="text">{{ $t('home') }}</v-btn>
        <v-btn v-if="userRole === 'admin'" :to="{ name: 'dashboard' }" variant="text">{{
          $t('dashboard')
        }}</v-btn>
        <v-btn v-if="!currentUser" :to="{ name: 'signup' }" variant="text">{{
          $t('signUp')
        }}</v-btn>
        <v-btn v-if="!currentUser" :to="{ name: 'login' }" variant="text">{{ $t('login') }}</v-btn>
      </div>
      <v-menu v-if="currentUser" offset-y>
        <template v-slot:activator="{ props }">
          <v-avatar v-bind="props" class="avatar" size="36">
            <v-img
              :src="
                userProfilePicture ||
                'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
              "
              alt="User Avatar"
              class="avatar-img"
              @error="
                userProfilePicture =
                  'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
              "
            />
          </v-avatar>
        </template>
        <v-list class="modern-menu">
          <v-list-item>
            <v-list-item-title class="menu-title">{{ currentUser.email }}</v-list-item-title>
          </v-list-item>
          <v-divider />
          <!-- Language Selection (Nested Menu) -->
          <v-list-item>
            <v-menu offset-x open-on-click>
              <template v-slot:activator="{ props }">
                <v-list-item-title v-bind="props" class="menu-item">
                  {{ $t('language') }}
                  <v-icon end>mdi-chevron-right</v-icon>
                </v-list-item-title>
              </template>
              <v-list class="modern-submenu">
                <v-list-item
                  v-for="lang in languageOptions"
                  :key="lang.value"
                  @click="currentLanguage = lang.value"
                >
                  <v-list-item-title>{{ lang.title }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-list-item>
          <!-- Theme Toggle -->
          <v-list-item>
            <v-btn @click="toggleTheme">{{ icon }}</v-btn>
          </v-list-item>
          <!-- Logout -->
          <v-list-item>
            <v-btn @click="logout" variant="text" class="w-100" prepend-icon="mdi-logout">
              {{ $t('logout') }}
            </v-btn>
          </v-list-item>
        </v-list>
      </v-menu>
    </nav>
  </header>
</template>

<script setup lang="ts">
defineOptions({
  name: 'AppNavbar',
})
// import { RouterLink, RouterView } from 'vue-router'
import { useTheme } from 'vuetify'
import { switchLanguage } from '../i18n'
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { auth, db } from '../firebase'
import { signOut, onAuthStateChanged } from 'firebase/auth'
import { useRouter } from 'vue-router'
// import { useI18n } from 'vue-i18n';
import { doc, onSnapshot, type Unsubscribe } from 'firebase/firestore'
const theme = useTheme()
const icon = ref('🌞')
const router = useRouter()
function toggleTheme() {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
  icon.value = theme.global.current.value.dark ? '🌞' : '🌙'
}

import type { User } from 'firebase/auth'

const currentUser = ref<User | null>(null)
const userRole = ref<string | null>(null)
const userProfilePicture = ref<string | null>(null)
let unsubscribeUserRole: Unsubscribe | null = null
// const languageOptions = ['en', 'fr']
onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    currentUser.value = user
    if (user) {
      // Set up a real-time listener for the user's role
      const userDocRef = doc(db, 'users', user.uid)
      unsubscribeUserRole = onSnapshot(
        userDocRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data()
            userRole.value = userData.role
            userProfilePicture.value =
              userData.images && userData.images.length > 0 ? userData.images[0] : null
          } else {
            userRole.value = null
            userProfilePicture.value = null
          }
        },
        (error) => {
          console.error('Error fetching user role:', error)
          userRole.value = null
          userProfilePicture.value = null
        },
      )
    } else {
      userRole.value = null
      userProfilePicture.value = null
      if (unsubscribeUserRole) {
        unsubscribeUserRole()
        unsubscribeUserRole = null
      }
    }
  })
})

onUnmounted(() => {
  if (unsubscribeUserRole) {
    unsubscribeUserRole()
  }
})

const logout = async () => {
  try {
    await signOut(auth)
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', (error as Error).message)
  }
}
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
<style scoped>
.text-green {
  color: green;
}
</style>
