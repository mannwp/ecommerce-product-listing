<!-- src/views/ProductDetails.vue -->
<template>
  <v-container class="modern-container">
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
        <v-card class="product-details-card" elevation="4">
          <v-card-title class="product-title">{{ product.name }}</v-card-title>
          <v-card-subtitle class="product-subtitle">
            ${{ product.price }} | {{ $t(product.category.toLowerCase()) }}
          </v-card-subtitle>
          <v-card-text>
            <v-chip :class="product.stockStatus === 'In Stock' ? 'in-stock' : 'out-of-stock'">
              {{ $t(product.stockStatus === 'In Stock' ? 'inStock' : 'outOfStock') }}
            </v-chip>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { auth, db } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import type { Product } from '../types/product'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const product = ref<Product | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

onMounted(async () => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // User is authenticated, fetch the product
      const productId = route.params.id as string
      if (productId) {
        loading.value = true
        error.value = null
        try {
          const productDocRef = doc(db, 'products', productId)
          const productDoc = await getDoc(productDocRef)
          if (productDoc.exists()) {
            product.value = { id: productDoc.id, ...productDoc.data() } as Product
          } else {
            product.value = null // Product not found
          }
        } catch (err) {
          error.value = t('fetchProductError')
          console.error('Error fetching product:', err)
        } finally {
          loading.value = false
        }
      } else {
        error.value = t('invalidProductId')
        loading.value = false
      }
    } else {
      // User is not authenticated, redirect to login
      router.push('/login')
    }
  })
})
</script>

<style scoped>
.modern-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  text-align: start;
}

.product-details-card {
  border-radius: 12px;
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
  background: linear-gradient(90deg, #4caf50, #66bb6a);
  color: white;
}

.out-of-stock {
  background: linear-gradient(90deg, #f44336, #ef5350);
  color: white;
}

.carousel-item {
  border-radius: 12px;
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
}
</style>
