<!-- src/views/SignUp.vue -->
<template>
  <v-container class="modern-container">
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-card class="modern-card" elevation="6" :class="{ 'animate-card': true }">
          <v-card-title class="form-title text-primary">
            {{ $t('signUp') }}
          </v-card-title>
          <v-card-text>
            <v-form v-model="formValid" @submit.prevent="signUp" ref="formRef">
              <v-text-field
                v-model="email"
                :label="$t('email')"
                type="email"
                :rules="emailRules"
                required
                outlined
                class="mb-4"
                prepend-inner-icon="mdi-email"
                color="primary"
              />
              <v-text-field
                v-model="password"
                :label="$t('password')"
                type="password"
                :rules="passwordRules"
                required
                outlined
                class="mb-4"
                prepend-inner-icon="mdi-lock"
                color="primary"
              />
              <v-file-input
                v-model="profilePicture"
                :label="$t('profilePicture')"
                accept="image/*"
                prepend-icon="mdi-camera"
                variant="outlined"
                :rules="imageRules"
                class="mb-4"
                color="primary"
              />
              <v-btn
                type="submit"
                color="primary"
                class="w-100 modern-btn mb-4"
                :disabled="!formValid || loading"
                :loading="loading"
              >
                {{ $t('signUp') }}
              </v-btn>
            </v-form>

            <!-- Google Sign-Up Button -->
            <v-btn
              color="secondary"
              class="w-100 modern-btn"
              :loading="googleLoading"
              @click="signUpWithGoogle"
            >
              <v-icon start>mdi-google</v-icon>
              {{ $t('signUpWithGoogle') }}
            </v-btn>

            <div class="text-center mt-4">
              <span class="text-body-2">
                {{ $t('haveAccount') }}
                <v-btn
                  :to="{ name: 'login' }"
                  variant="text"
                  color="primary"
                  class="modern-link-btn"
                >
                  {{ $t('login') }}
                </v-btn>
              </span>
            </div>
          </v-card-text>
          <!-- <v-overlay
            :model-value="loading || googleLoading"
            contained
            class="align-center justify-center"
            scrim="#00000080"
          >
            <v-progress-circular indeterminate color="primary" size="64" />
          </v-overlay> -->
        </v-card>
      </v-col>
    </v-row>

    <!-- Snackbar for error messages -->
    <v-snackbar
      v-model="showError"
      :timeout="5000"
      color="error"
      rounded="lg"
      location="bottom"
      :max-width="344"
    >
      {{ errorMessage }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="showError = false">
          {{ $t('close') }}
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { auth, db } from '../firebase'
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import type { VForm } from 'vuetify/components'

const { t } = useI18n()
const router = useRouter()

const email = ref('')
const password = ref('')
const profilePicture = ref<File | null>(null)
const formValid = ref(false)
const formRef = ref<VForm | null>(null)
const loading = ref(false)
const googleLoading = ref(false) // Separate loading state for Google Sign-Up
const showError = ref(false)
const errorMessage = ref('')

const emailRules = [
  (v: string) => !!v || t('required'),
  (v: string) => /.+@.+\..+/.test(v) || t('emailInvalid'),
]
const passwordRules = [
  (v: string) => !!v || t('required'),
  (v: string) => v.length >= 6 || t('passwordMinLength'),
]
const imageRules = [
  (v: File | null) => !v || v.size <= 750 * 1024 || t('imageSizeLimit'),
  (v: File | null) => !v || v.type.startsWith('image/') || t('imageType'),
]

// Convert file to Base64 string
const toBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}

// Email/Password Sign-Up
const signUp = async () => {
  const { valid } = await formRef.value!.validate()
  if (valid) {
    loading.value = true
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value)
      const user = userCredential.user

      let images: string[] = []
      if (profilePicture.value) {
        const base64String = await toBase64(profilePicture.value)
        images = [base64String]
      }

      await setDoc(doc(db, 'users', user.uid), {
        email: email.value,
        role: 'user',
        images,
      })

      router.push('/dashboard')
    } catch (error) {
      console.error('Sign-up error:', error)
      errorMessage.value = getErrorMessage((error as { code: string }).code)
      showError.value = true
    } finally {
      loading.value = false
    }
  }
}

// Google Sign-Up
const signUpWithGoogle = async () => {
  googleLoading.value = true
  try {
    const provider = new GoogleAuthProvider()
    const userCredential = await signInWithPopup(auth, provider)
    const user = userCredential.user

    // Check if the user already exists in Firestore
    const userDocRef = doc(db, 'users', user.uid)
    const userDoc = await getDoc(userDocRef)

    if (!userDoc.exists()) {
      // New user, create their Firestore document
      const images = user.photoURL ? [user.photoURL] : []
      await setDoc(userDocRef, {
        email: user.email,
        role: 'user',
        images,
      })
    }

    router.push('/dashboard')
  } catch (error) {
    console.error('Google Sign-Up error:', error)
    errorMessage.value = getGoogleErrorMessage((error as { code: string }).code)
    showError.value = true
  } finally {
    googleLoading.value = false
  }
}

const getErrorMessage = (errorCode: string) => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return t('emailAlreadyInUse')
    case 'auth/invalid-email':
      return t('emailInvalid')
    case 'auth/weak-password':
      return t('passwordWeak')
    case 'auth/operation-not-allowed':
      return t('operationNotAllowed')
    default:
      return t('signUpError')
  }
}

const getGoogleErrorMessage = (errorCode: string) => {
  switch (errorCode) {
    case 'auth/popup-closed-by-user':
      return t('googlePopupClosed')
    case 'auth/cancelled-popup-request':
      return t('googlePopupCancelled')
    case 'auth/popup-blocked':
      return t('googlePopupBlocked')
    default:
      return t('googleSignInError')
  }
}
</script>

<style scoped>
.modern-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 1.5rem;
  background-color: #f5f5f5;
}

.modern-card {
  border-radius: 16px;
  background: #ffffff;
  transition: all 0.3s ease;
}

.modern-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.animate-card {
  animation: fadeInUp 0.6s ease-out;
}

.form-title {
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  padding: 1.5rem 0;
  letter-spacing: 0.5px;
}

.modern-btn {
  border-radius: 8px;
  text-transform: none;
  font-weight: 600;
  font-size: 1rem;
  padding: 0.75rem 1.5rem;
  transition: all 0.3s ease;
}

.modern-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.modern-link-btn {
  text-transform: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.modern-link-btn:hover {
  color: #1976d2; /* secondary color */
}

.modern-snackbar {
  background: linear-gradient(90deg, #f44336, #ef5350) !important;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 960px) {
  .modern-container {
    padding: 2rem 1rem;
  }

  .form-title {
    font-size: 1.75rem;
  }
}

@media (max-width: 600px) {
  .modern-container {
    padding: 1.5rem 0.5rem;
  }

  .form-title {
    font-size: 1.5rem;
  }

  .modern-btn {
    font-size: 0.9rem;
    padding: 0.5rem 1rem;
  }

  .modern-snackbar {
    margin: 0 16px;
  }
}
</style>
