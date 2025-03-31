<template>
  <v-card class="product-card" elevation="4">
    <v-img :src="product.images[0]" height="200" class="product-image" cover />
    <v-card-title class="product-title">{{ product.name }}</v-card-title>
    <v-card-subtitle class="product-subtitle">
      <span class="font-weight-bold">${{ product.price }}</span> |
      {{ $t(product.category.toLowerCase()) }}
    </v-card-subtitle>
    <v-card-text>
      <v-chip :class="product.stockStatus === 'In Stock' ? 'in-stock' : 'out-of-stock'" small>
        {{ $t(product.stockStatus === 'In Stock' ? 'inStock' : 'outOfStock') }}
      </v-chip>
      <!-- Review Summary -->
      <div class="review-summary mt-2">
        <div class="d-flex align-center">
          <v-rating
            :model-value="averageRating"
            readonly
            color="yellow-darken-3"
            background-color="grey-lighten-1"
            half-increments
            length="5"
            size="18"
          />
          <span class="ml-2 text-body-2">
            {{ averageRating.toFixed(1) }} ({{ reviewCount }} {{ $t('reviews') }})
          </span>
        </div>
      </div>
    </v-card-text>
    <v-card-actions v-if="isAdmin">
      <v-btn color="primary" @click.stop="$emit('edit', product)" class="action-button">
        {{ $t('edit') }}
      </v-btn>
      <v-btn
        color="error"
        @click.stop="product.id ? $emit('delete', product.id) : null"
        class="action-button"
      >
        {{ $t('delete') }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Product } from '../types/product'

const props = defineProps<{
  product: Product
  isAdmin?: boolean
  averageRating?: number
  reviewCount?: number
}>()

defineEmits<{
  (e: 'edit', product: Product): void
  (e: 'delete', id: string): void
}>()

const averageRating = computed(() => props.averageRating ?? 0)
const reviewCount = computed(() => props.reviewCount ?? 0)
</script>

<style scoped>
.product-card {
  border-radius: 12px;
  transition: transform 0.3s ease;
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.product-image {
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}

.product-title {
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.5;
}

.product-subtitle {
  font-size: 1rem;
  /* color: #666; */
}

.in-stock {
  background: linear-gradient(90deg, #4caf50, #66bb6a);
  color: white;
}

.out-of-stock {
  background: linear-gradient(90deg, #f44336, #ef5350);
  color: white;
}

.action-button {
  text-transform: none;
  font-weight: 600;
}

.review-summary {
  display: flex;
  align-items: center;
}

@media (max-width: 600px) {
  .product-title {
    font-size: 1.1rem;
  }

  .product-subtitle {
    font-size: 0.9rem;
  }

  .action-button {
    font-size: 0.85rem;
  }
}
</style>
