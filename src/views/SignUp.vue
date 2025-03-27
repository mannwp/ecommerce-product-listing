<!-- src/views/SignUp.vue -->
<template>
  <v-container class="modern-container">
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-card class="modern-card">
          <v-card-title class="form-title">{{ $t('signUp') }}</v-card-title>
          <v-card-text>
            <v-form v-model="formValid" @submit.prevent="signUp" ref="formRef">
              <v-text-field
                v-model="email"
                :label="$t('email')"
                type="email"
                :rules="emailRules"
                required
              />
              <v-text-field
                v-model="password"
                :label="$t('password')"
                type="password"
                :rules="passwordRules"
                required
              />
              <v-file-input
                v-model="profilePicture"
                :label="$t('profilePicture')"
                accept="image/*"
                prepend-icon="mdi-camera"
                variant="filled"
                :rules="imageRules"
              />
              <v-btn
                type="submit"
                color="success"
                class="w-100"
                :disabled="!formValid || loading"
                :loading="loading"
              >
                {{ $t('signUp') }}
              </v-btn>
            </v-form>
          </v-card-text>
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
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import type { VForm } from 'vuetify/components'

const { t } = useI18n()
const router = useRouter()

const email = ref('')
const password = ref('')
const profilePicture = ref<File | null>(null) // Changed from File[] to File
const formValid = ref(false)
const formRef = ref<VForm | null>(null)
const loading = ref(false)
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
  (v: File | null) => {
    if (!v) return true // No file selected, validation passes
    return v.size <= 2 * 1024 * 1024 || t('imageSizeLimit') // 2MB limit
  },
  (v: File | null) => {
    if (!v) return true // No file selected, validation passes
    return v.type.startsWith('image/') || t('imageType')
  },
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

const signUp = async () => {
  const { valid } = await formRef.value!.validate()
  if (valid) {
    loading.value = true
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value)
      const user = userCredential.user

      // Convert profile picture to Base64 if provided
      let images: string[] = []
      if (profilePicture.value) {
        // Changed from profilePicture.value.length > 0
        const base64String = await toBase64(profilePicture.value)
        images = [base64String]
      }

      // Save user data to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: email.value,
        role: 'user',
        images, // Store as an array of Base64 strings
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
</script>

<style scoped>
.modern-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.modern-card {
  border-radius: 12px;
  background: linear-gradient(145deg, #ffffff, #f5f5f5);
  transition: transform 0.3s ease;
}

.modern-card:hover {
  transform: translateY(-5px);
}

.form-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #333;
  text-align: center;
  padding: 1rem;
}

.w-100 {
  width: 100%;
  border-radius: 8px;
  text-transform: none;
  font-weight: 600;
  background: linear-gradient(90deg, #4caf50, #66bb6a);
  transition:
    background 0.3s ease,
    transform 0.2s ease;
}

.w-100:hover {
  background: linear-gradient(90deg, #66bb6a, #4caf50);
  transform: translateY(-2px);
}

.modern-snackbar {
  background: linear-gradient(90deg, #f44336, #ef5350) !important;
}

@media (max-width: 600px) {
  .modern-container {
    padding: 1rem;
  }

  .form-title {
    font-size: 1.5rem;
  }

  .modern-snackbar {
    margin: 0 16px;
  }
}
</style>
