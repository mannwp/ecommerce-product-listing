<!-- src/views/ProductListing.vue -->
<template>
  <v-container class="modern-container">
    <h1 class="page-title">{{ $t('listing') }}</h1>
    <product-filter v-model="filters" class="filter-section" />
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
    <v-row v-else-if="filteredProducts.length === 0">
      <v-col cols="12">
        <v-alert type="info" class="text-center">
          {{ $t('noProducts') }}
        </v-alert>
      </v-col>
    </v-row>
    <v-row v-else>
      <v-col v-for="product in filteredProducts" :key="product.id" cols="12" sm="6" md="4">
        <router-link
          :to="{ name: 'product-details', params: { id: product.id } }"
          class="text-decoration-none"
        >
          <product-card
            :product="product"
            :average-rating="productStore.getAverageRating(product.id)"
            :review-count="productStore.getReviewCount(product.id)"
          />
        </router-link>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useProductStore } from '../stores/productStore'
import ProductCard from '../components/ProductCard.vue'
import ProductFilter from '../components/ProductFilter.vue'
import { useI18n } from 'vue-i18n'
// import type { Product } from '@/types/product';

const { t } = useI18n()
const productStore = useProductStore()
const { products, fetchProducts, fetchAllReviews } = productStore

const filters = ref({
  category: '',
  sortBy: 'price' as 'price' | 'name',
  sortOrder: 'asc' as 'asc' | 'desc',
})

const loading = ref(false)
const error = ref<string | null>(null)

const filteredProducts = computed(() => {
  let result = products.value

  if (filters.value.category) {
    result = result.filter((p) => p.category === filters.value.category)
  }

  return result.sort((a, b) => {
    const multiplier = filters.value.sortOrder === 'asc' ? 1 : -1
    return filters.value.sortBy === 'price'
      ? multiplier * (a.price - b.price)
      : multiplier * a.name.localeCompare(b.name)
  })
})

let unsubscribeReviews: Array<() => void> = []

onMounted(async () => {
  loading.value = true
  error.value = null
  try {
    await fetchProducts()
    // Fetch reviews for all products
    unsubscribeReviews = fetchAllReviews()
  } catch (err) {
    error.value = t('fetchProductsError')
    console.error('Error fetching products:', err)
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  // Clean up review listeners
  unsubscribeReviews.forEach((unsubscribe) => unsubscribe())
})
</script>

<style scoped>
/* Modern Container */
.modern-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* Page Title */
.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  text-align: start;
}

/* Filter Section */
.filter-section {
  margin-bottom: 2rem;
}

/* Responsive Adjustments */
@media (max-width: 600px) {
  .modern-container {
    padding: 1rem;
  }

  .page-title {
    font-size: 1.5rem;
  }
}
</style>
