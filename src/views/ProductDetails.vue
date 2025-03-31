<!-- src/views/ProductDetails.vue -->
<template>
  <v-container class="modern-container mx-16">
    <h1 class="page-title">{{ $t('productDetails') }}</h1>
    <v-row v-if="loading">
      <v-col cols="12">
        <v-progress-circular indeterminate color="primary" :size="50" class="d-block mx-auto" />
      </v-col>
    </v-row>
    <v-row v-else-if="error">
      <v-col cols="12">
        <v-alert type="error" class="text-center">
          {{ error }}
        </v-alert>
      </v-col>
    </v-row>
    <v-row v-else-if="!product">
      <v-col cols="12">
        <v-alert type="info" class="text-center">
          {{ $t('productNotFound') }}
        </v-alert>
      </v-col>
    </v-row>
    <v-row v-else>
      <v-col cols="12" md="6">
        <v-carousel hide-delimiters height="400" class="rounded-lg">
          <v-carousel-item
            v-for="(image, index) in product.images"
            :key="index"
            :src="image"
            class="carousel-item"
          />
        </v-carousel>
      </v-col>
      <v-col cols="12" md="6">
        <v-card class="product-details-card border border-grey-darken-4">
          <v-card-title class="product-title">{{ product.name }}</v-card-title>
          <v-card-subtitle class="product-subtitle">
            ${{ product.price }} | {{ $t(product.category.toLowerCase()) }}
          </v-card-subtitle>
          <v-card-text>
            <v-chip :class="product.stockStatus === 'In Stock' ? 'in-stock' : 'out-of-stock'" small>
              {{ $t(product.stockStatus === 'In Stock' ? 'inStock' : 'outOfStock') }}
            </v-chip>
            <!-- Enhanced Review Summary -->
            <div class="review-summary mt-4">
              <div class="d-flex align-center mb-2">
                <v-rating
                  :model-value="averageRating"
                  readonly
                  color="yellow-darken-3"
                  background-color="grey-lighten-1"
                  half-increments
                  length="5"
                  size="24"
                />
                <span class="ml-2 text-body-1 font-weight-medium">
                  {{ averageRating.toFixed(1) }} ({{ reviews.length }} {{ $t('reviews') }})
                </span>
              </div>
              <div v-if="mostRecentReview" class="recent-review">
                <p class="text-body-2 font-weight-medium mb-1">
                  {{ $t('recentReview') }} - {{ mostRecentReview.email }}
                </p>
                <v-rating
                  :model-value="mostRecentReview.rating"
                  readonly
                  color="yellow-darken-3"
                  background-color="grey-lighten-1"
                  length="5"
                  size="18"
                  class="mb-1"
                />
                <p class="text-body-2 text-grey-darken-1">
                  {{ truncateReview(mostRecentReview.reviewText, 100) }}
                </p>
              </div>
              <p v-else class="text-body-2 text-grey">
                {{ $t('noReviews') }}
              </p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Review Submission Form (for logged-in users) -->
      <v-col cols="12">
        <v-card class="modern-card mb-6 border border-grey-darken-4">
          <v-card-title class="text-h5 text-primary">
            {{ $t('addReview') }}
          </v-card-title>
          <v-card-text>
            <v-form
              v-if="currentUser"
              v-model="formValid"
              @submit.prevent="submitReview"
              ref="reviewForm"
            >
              <v-rating
                v-model="rating"
                id="testRating"
                color="yellow-darken-3"
                background-color="grey-lighten-1"
                length="5"
                size="32"
                class="mb-4"
              />
              <v-textarea
                v-model="reviewText"
                :label="$t('yourReview')"
                :rules="reviewRules"
                variant="outlined"
                rows="3"
                color="primary"
                class="mb-4"
                id="review-textarea"
              />

              <v-btn
                type="submit"
                color="primary"
                class="w-100 modern-btn"
                :disabled="reviewLoading"
                :loading="reviewLoading"
              >
                {{ $t('submitReview') }}
              </v-btn>
            </v-form>

            <div v-else class="text-center">
              <p class="text-body-1">{{ $t('loginToReview') }}</p>
              <v-btn color="primary" class="modern-btn" @click="router.push('/login')">
                {{ $t('login') }}
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Display Reviews -->
      <v-col cols="12">
        <v-card class="modern-card border border-grey-darken-4">
          <v-card-title class="text-h5 text-primary">
            {{ $t('reviews') }} ({{ reviews.length }})
          </v-card-title>
          <v-card-text>
            <v-list v-if="reviews.length > 0">
              <v-list-item v-for="review in reviews" :key="review.id" class="review-item">
                <v-list-item-title class="d-flex align-center">
                  <v-rating
                    :model-value="review.rating"
                    readonly
                    color="yellow-darken-3"
                    background-color="grey-lighten-1"
                    length="5"
                    size="20"
                    class="mr-2"
                  />
                  <span class="text-subtitle-1">{{ review.email }}</span>
                </v-list-item-title>
                <v-list-item-subtitle class="mt-1">
                  {{ review.reviewText }}
                </v-list-item-subtitle>
                <v-list-item-subtitle class="text-caption text-grey">
                  {{ formatDate(review.createdAt) }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
            <p v-else class="text-body-1 text-grey">
              {{ $t('noReviews') }}
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Snackbar for success/error messages -->
    <v-snackbar
      v-model="showMessage"
      :timeout="5000"
      :color="messageType"
      rounded="lg"
      location="bottom"
      :max-width="344"
    >
      {{ message }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="showMessage = false">
          {{ $t('close') }}
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { auth } from '../firebase'
import { onAuthStateChanged, type User } from 'firebase/auth'
import type { Product } from '@/types/product'
import type { VForm } from 'vuetify/components'
import { Timestamp } from 'firebase/firestore'
import { useProductStore } from '../stores/productStore'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const productStore = useProductStore()

console.log('productStore in component:', productStore) // Debug: Log the store instance

const loading = ref(false)
const error = ref<string | null>(null)
const product = ref<Product | null>(null)

const rating = ref(0)
const reviewText = ref('')
const formValid = ref(false)
const reviewForm = ref<VForm | null>(null)
const reviewLoading = ref(false)
const showMessage = ref(false)
const message = ref('')
const messageType = ref('success')
const currentUser = ref<User | null>(null)

// Get reviews from the store
const reviews = computed(() => {
  const productId = route.params.id as string
  return productStore.getReviews(productId)
})

// Compute average rating using the store
const averageRating = computed(() => {
  const productId = route.params.id as string
  return productStore.getAverageRating(productId)
})

// Compute most recent review
const mostRecentReview = computed(() => {
  if (reviews.value.length === 0) return null
  return reviews.value[0] // Already sorted by createdAt descending
})

const reviewRules = [
  (v: string) => !!v || t('required'),
  (v: string) => v.length <= 500 || t('reviewMaxLength'),
]

// Fetch product details using productStore
const loadProduct = async () => {
  const productId = route.params.id as string
  if (productId) {
    loading.value = true
    error.value = null
    try {
      const fetchedProduct = await productStore.fetchProduct(productId)
      product.value = fetchedProduct
    } catch (err) {
      error.value = t('fetchProductError')
      console.error('Error fetching product:', err)
      product.value = null // Product not found
    } finally {
      loading.value = false
    }
  } else {
    error.value = t('invalidProductId')
    loading.value = false
  }
}

// Truncate review text for preview
const truncateReview = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// Format timestamp to readable date
const formatDate = (timestamp: Timestamp) => {
  if (!timestamp) return ''
  const date = timestamp.toDate()
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Submit a review using the store
const submitReview = async () => {
  if (!currentUser.value) {
    message.value = t('notAuthenticated')
    messageType.value = 'error'
    showMessage.value = true
    router.push('/login')
    return
  }

  const { valid } = await reviewForm.value!.validate()
  if (valid && rating.value > 0) {
    reviewLoading.value = true
    try {
      const productId = route.params.id as string
      await productStore.addReview(productId, {
        userId: currentUser.value.uid,
        email: currentUser.value.email || '',
        rating: rating.value,
        reviewText: reviewText.value,
      })

      // Reset form
      rating.value = 0
      reviewText.value = ''
      reviewForm.value!.resetValidation()

      message.value = t('reviewSubmitted')
      messageType.value = 'success'
      showMessage.value = true
    } catch (error) {
      console.error('Error submitting review:', error)
      message.value = t('submitReviewError')
      messageType.value = 'error'
      showMessage.value = true
    } finally {
      reviewLoading.value = false
    }
  } else if (rating.value === 0) {
    message.value = t('ratingRequired')
    messageType.value = 'error'
    showMessage.value = true
  }
}

let unsubscribeReviews: (() => void) | null = null

onMounted(() => {
  console.log('onMounted called') // Debug: Confirm onMounted is called
  console.log('route.params.id:', route.params.id) // Debug: Log the productId
  loadProduct()
  const productId = route.params.id as string
  unsubscribeReviews = productStore.fetchReviewsForProduct(productId)
  onAuthStateChanged(auth, (user) => {
    currentUser.value = user
  })
})

onUnmounted(() => {
  if (unsubscribeReviews) unsubscribeReviews()
})
</script>

<style scoped>
/* Same styles as before */
.modern-container {
  max-width: 1440px;
  padding: 1rem 0;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  text-align: start;
}

.product-details-card {
  border-radius: 8px;
  transition: transform 0.3s ease;
}

.product-title {
  font-size: 1.75rem;
  font-weight: 600;
}

.product-subtitle {
  font-size: 1.1rem;
}

.in-stock {
  color: green;
  font-weight: 400;
  font-size: small;
  border: 1px solid green;
  padding: 0px;
}

.out-of-stock {
  color: red;
  font-weight: 400;
  font-size: small;
  border: 1px solid red;
}

.carousel-item {
  border-radius: 8px;
}

.modern-card {
  border-radius: 8px;
  transition: transform 0.3s ease;
}

.modern-btn {
  border-radius: 8px;
  text-transform: none;
  font-size: 1rem;
  /* padding: 0.75rem 1.5rem; */
  transition: all 0.3s ease;
}

.modern-snackbar {
  background: linear-gradient(90deg, #4caf50, #66bb6a) !important;
}

.modern-snackbar.error {
  background: linear-gradient(90deg, #f44336, #ef5350) !important;
}

.review-item {
  padding: 1rem 0;
}

.review-item:last-child {
  border-bottom: none;
}

/* Review Summary Styles */
.review-summary {
  padding-top: 1rem;
}

.recent-review {
  padding: 0.75rem;
  border-radius: 8px;
}

@media (max-width: 960px) {
  .modern-container {
    padding: 1.5rem;
  }
}

@media (max-width: 600px) {
  .modern-container {
    padding: 1rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .product-title {
    font-size: 1.5rem;
  }

  .product-subtitle {
    font-size: 0.95rem;
  }

  .text-h5 {
    font-size: 1.25rem !important;
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
