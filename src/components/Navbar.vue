<!-- src/components/Navbar.vue -->
<template>
  <header
    class="modern-header d-flex align-center border-b w-100"
    :class="{ 'pa-4': $vuetify.display.smAndUp, 'pa-2': $vuetify.display.xs }"
  >
    <span class="text-h5 font-weight-bold text-primary">VueCart</span>
    <v-spacer />
    <nav
      class="d-flex align-center"
      :class="{ 'ga-6': $vuetify.display.smAndUp, 'ga-4': $vuetify.display.xs }"
    >
      <div class="d-flex align-center">
        <v-btn
          :to="{ name: 'home' }"
          variant="text"
          class="modern-nav-btn"
          :class="{ 'text-body-1': $vuetify.display.smAndUp, 'text-body-2': $vuetify.display.xs }"
        >
          {{ $t('home') }}
        </v-btn>
        <v-btn
          v-if="userRole === 'admin'"
          :to="{ name: 'dashboard' }"
          variant="text"
          class="modern-nav-btn"
          :class="{ 'text-body-1': $vuetify.display.smAndUp, 'text-body-2': $vuetify.display.xs }"
        >
          {{ $t('dashboard') }}
        </v-btn>
        <v-btn
          v-if="!currentUser"
          :to="{ name: 'signup' }"
          variant="text"
          class="modern-nav-btn"
          :class="{ 'text-body-1': $vuetify.display.smAndUp, 'text-body-2': $vuetify.display.xs }"
        >
          {{ $t('signUp') }}
        </v-btn>
        <v-btn
          v-if="!currentUser"
          :to="{ name: 'login' }"
          variant="text"
          class="modern-nav-btn"
          :class="{ 'text-body-1': $vuetify.display.smAndUp, 'text-body-2': $vuetify.display.xs }"
        >
          {{ $t('login') }}
        </v-btn>
      </div>
      <v-progress-circular v-if="loading" indeterminate color="primary" size="24" class="mr-4" />
      <v-menu v-if="currentUser" offset-y transition="slide-y-transition">
        <template v-slot:activator="{ props }">
          <v-avatar v-bind="props" class="avatar-hover" :size="$vuetify.display.smAndUp ? 40 : 36">
            <v-img
              :src="
                userProfilePicture ||
                currentUser.photoURL ||
                'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
              "
              alt="User Avatar"
              class="avatar-img"
              @error="
                userProfilePicture =
                  currentUser.photoURL ||
                  'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
              "
            />
          </v-avatar>
        </template>
        <v-list class="modern-menu">
          <v-list-item>
            <v-list-item-title class="menu-title text-subtitle-1">
              {{ currentUser.email }}
            </v-list-item-title>
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
                  class="submenu-item"
                >
                  <v-list-item-title>{{ lang.title }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-list-item>
          <!-- Theme Toggle -->
          <v-list-item>
            <v-btn variant="text" class="modern-menu-btn w-100" @click="toggleTheme">
              <span class="mr-2">{{ $t('theme') }}</span>
              {{ icon }}
            </v-btn>
          </v-list-item>
          <!-- Logout -->
          <v-list-item>
            <v-btn
              variant="text"
              color="primary"
              class="modern-menu-btn w-100"
              prepend-icon="mdi-logout"
              @click="logout"
            >
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

import { useTheme } from 'vuetify'
import { switchLanguage } from '../i18n'
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { auth, db } from '../firebase'
import { signOut, onAuthStateChanged } from 'firebase/auth'
import { useRouter } from 'vue-router'
import { doc, onSnapshot, type Unsubscribe } from 'firebase/firestore'
import type { User } from 'firebase/auth'

const theme = useTheme()
const icon = ref('🌞')
const router = useRouter()

const toggleTheme = () => {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
  icon.value = theme.global.current.value.dark ? '🌞' : '🌙'
}

const currentUser = ref<User | null>(null)
const userRole = ref<string | null>(null)
const userProfilePicture = ref<string | null>(null)
const loading = ref(false)
let unsubscribeUserRole: Unsubscribe | null = null

const languageOptions = [
  { title: 'English', value: 'en' },
  { title: 'Français', value: 'fr' },
  { title: 'العربية', value: 'ar' },
]
const currentLanguage = ref('en')

watch(currentLanguage, (newLang) => {
  switchLanguage(newLang as 'en' | 'fr' | 'ar')
})

onMounted(() => {
  loading.value = true
  onAuthStateChanged(auth, (user) => {
    currentUser.value = user
    if (user) {
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
          loading.value = false
        },
        (error) => {
          console.error('Error fetching user data:', error)
          userRole.value = null
          userProfilePicture.value = null
          loading.value = false
        },
      )
    } else {
      userRole.value = null
      userProfilePicture.value = null
      loading.value = false
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
</script>

<style scoped>
.modern-header {
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.modern-header:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.modern-nav-btn {
  text-transform: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.modern-nav-btn:hover {
  color: #1976d2; /* secondary color */
  transform: translateY(-2px);
}

.avatar-hover {
  transition: transform 0.3s ease;
}

.avatar-hover:hover {
  transform: scale(1.1);
}

.modern-menu {
  /* background-color: #ffffff; */
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.menu-title {
  font-weight: 600;
}

.menu-item {
  font-weight: 500;
  transition: background-color 0.3s ease;
}

.modern-submenu {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.submenu-item {
  transition: background-color 0.3s ease;
}

.modern-menu-btn {
  text-transform: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

@media (max-width: 960px) {
  .modern-header {
    flex-direction: column;
    gap: 1rem;
  }

  nav {
    justify-content: center;
    flex-wrap: wrap;
  }
}

@media (max-width: 600px) {
  .modern-header {
    padding: 1rem 0.5rem;
  }

  .text-h5 {
    font-size: 1.25rem !important;
  }

  nav {
    gap: 0.5rem;
  }
}
</style>
