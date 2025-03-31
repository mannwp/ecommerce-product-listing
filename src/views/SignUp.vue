<!-- src/views/SignUp.vue -->
<template>
  <v-container class="modern-container">
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-card
          class="modern-card border-grey-darken-2 border"
          color="background"
          :class="{ 'animate-card': true }"
        >
          <v-card-title class="form-title">
            {{ $t('signUp') }}
          </v-card-title>
          <v-card-subtitle class="form-subtitle">
            {{ $t('createAccount') }}
          </v-card-subtitle>
          <v-card-text>
            <v-form v-model="formValid" @submit.prevent="signUp" ref="formRef">
              <v-text-field
                v-model="email"
                :label="$t('email')"
                type="email"
                :rules="emailRules"
                required
                variant="outlined"
                class="mb-4"
                hide-details="auto"
                prepend-inner-icon="mdi-email-outline"
                color="primary"
              />
              <v-text-field
                v-model="password"
                :label="$t('password')"
                type="password"
                :rules="passwordRules"
                required
                variant="outlined"
                class="mb-4"
                hide-details="auto"
                prepend-inner-icon="mdi-lock-outline"
                color="primary"
              />
              <v-file-input
                v-model="profilePicture"
                :label="$t('profilePicture')"
                accept="image/*"
                prepend-icon="mdi-image-plus-outline"
                variant="outlined"
                :rules="imageRules"
                class="mb-4"
                hide-details="auto"
                color="primary"
              />
              <v-btn
                type="submit"
                color="blue-accent-3"
                class="w-100 mb-4 font-weight-medium text-capitalize"
                :disabled="loading"
                :loading="loading"
              >
                {{ $t('signUp') }}
              </v-btn>
            </v-form>

            <!-- Google Sign-Up Button -->
            <v-btn
              color="background"
              class="w-100 text-capitalize font-weight-medium border border-grey-darken-2"
              :loading="googleLoading"
              @click="signUpWithGoogle"
            >
              <v-icon start size="24"
                ><svg class="mr-2 h-10 w-10" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  ></path>
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  ></path>
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  ></path>
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  ></path>
                  <path d="M1 1h22v22H1z" fill="none"></path></svg
              ></v-icon>
              {{ $t('signUpWithGoogle') }}
            </v-btn>

            <div class="text-center mt-4">
              <span class="text-body-2 text-gray">
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
  max-width: 1000px;
  margin: 0 auto;
  padding: 3rem 1.5rem;
}

.modern-card {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.animate-card {
  animation: fadeInUp 0.6s ease-out;
}

.form-title {
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
  padding: 1.5rem 0 0 0;
  letter-spacing: 0px;
}
.form-subtitle {
  font-size: 1rem;
  font-weight: 400;
  text-align: center;
  letter-spacing: 0.5px;
}
.v-btn {
  letter-spacing: 0rem;
}
.modern-link-btn {
  text-transform: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.modern-link-btn:hover {
  color: #1976d2; /* secondary color */
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
