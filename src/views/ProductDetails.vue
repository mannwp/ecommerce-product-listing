<!-- src/views/ProductDetails.vue -->
<template>
  <v-container class="modern-container">
    <v-row>
      <!-- Image Carousel Section -->
      <v-col cols="12" md="6">
        <v-card elevation="4" class="image-card">
          <v-carousel
            v-if="product?.images?.length"
            :show-arrows="product.images.length > 1"
            hide-delimiters
            height="400"
            class="modern-carousel"
          >
            <v-carousel-item
              v-for="(image, index) in product?.images || []"
              :key="index"
              :src="image"
            >
              <!-- <v-img :src="image" height="400" class="rounded-image" /> -->
            </v-carousel-item>
          </v-carousel>
          <v-img
            v-else
            src="https://via.placeholder.com/300x200?text=No+Image"
            height="400"
            class="rounded-image"
          />
        </v-card>
      </v-col>

      <!-- Product Details Section -->
      <v-col cols="12" md="6">
        <v-card elevation="2" class="details-card pa-6">
          <h1 class="product-title">{{ product?.name }}</h1>
          <v-chip
            class="stock-chip mb-4"
            :class="product?.stockStatus === 'In Stock' ? 'in-stock' : 'out-of-stock'"
            small
          >
            {{ $t(product?.stockStatus === 'In Stock' ? 'inStock' : 'outOfStock') }}
          </v-chip>
          <div class="price-section mb-4">
            <span class="price-label">{{ $t('price') }}:</span>
            <span class="price-value">${{ product?.price }}</span>
          </div>
          <div class="category-section mb-6">
            <span class="category-label">{{ $t('category') }}:</span>
            <span class="category-value">{{ $t((product?.category || '').toLowerCase()) }}</span>
          </div>
          <v-btn color="success" class="back-button" :to="{ name: 'home' }" elevation="2">
            {{ $t('backToListing') }}
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useProductStore } from '../stores/productStore'

const route = useRoute()
const productStore = useProductStore()
const product = computed(() => productStore.products.find((p) => p.id === route.params.id))
</script>

<style scoped>
/* Modern Container */
.modern-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* Image Card */
.image-card {
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease;
}

.rounded-image {
  border-radius: 8px;
}

/* Thumbnails */
.thumbnail-col {
  padding: 0.25rem;
}

.thumbnail {
  border-radius: 6px;
  cursor: pointer;
  transition:
    opacity 0.3s ease,
    border 0.3s ease;
  opacity: 0.6;
  border: 2px solid transparent;
}

.thumbnail:hover {
  opacity: 1;
}

.active-thumbnail {
  opacity: 1;
  border: 2px solid #4caf50;
}

/* Details Card */
.details-card {
  border-radius: 12px;
  background: linear-gradient(145deg, backround, forground);
  transition: transform 0.3s ease;
}

/* Product Title */
.product-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  line-height: 1.2;
}

/* Stock Chip */
.stock-chip {
  font-weight: 600;
  transition: background-color 0.3s ease;
}

.in-stock {
  background: linear-gradient(90deg, #4caf50, #66bb6a);
  color: white;
}

.out-of-stock {
  background: linear-gradient(90deg, #f44336, #ef5350);
  color: white;
}

/* Price and Category Sections */
.price-section,
.category-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.price-label,
.category-label {
  font-size: 1.1rem;
  font-weight: 500;
}

.price-value,
.category-value {
  font-size: 1.1rem;
  font-weight: 600;
}

/* Back Button */
.back-button {
  border-radius: 8px;
  text-transform: none;
  font-weight: 600;
  padding: 0.5rem 1.5rem;
  background: linear-gradient(90deg, #4caf50, #66bb6a);
  transition:
    background 0.3s ease,
    transform 0.2s ease;
}

.back-button:hover {
  background: linear-gradient(90deg, #66bb6a, #4caf50);
  transform: translateY(-2px);
}

/* Responsive Adjustments */
@media (max-width: 600px) {
  .product-title {
    font-size: 1.5rem;
  }

  .modern-container {
    padding: 1rem;
  }

  .details-card {
    padding: 1rem;
  }

  .back-button {
    width: 100%;
  }
}
</style>
