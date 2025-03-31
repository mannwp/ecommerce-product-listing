<template>
  <v-card class="product-card border border-grey-darken-2">
    <v-img :src="product.images[0]" height="300" class="product-image" cover />
    <v-card-title class="product-title d-flex justify-space-between"
      >{{ product.name }}
      <v-chip :class="product.stockStatus === 'In Stock' ? 'in-stock' : 'out-of-stock'" small>
        {{ $t(product.stockStatus === 'In Stock' ? 'inStock' : 'outOfStock') }}
      </v-chip></v-card-title
    >
    <v-card-title class="d-flex justify-space-between align-center">
      <span class="font-weight-medium">${{ product.price }}</span>
      <span class="text-grey text-subtitle-1">
        {{ $t(product.category.toLowerCase()) }}
      </span>
    </v-card-title>
    <v-card-text>
      <!-- Review Summary -->
      <div class="review-summary mt-2">
        <div class="d-flex align-center justify-center">
          <v-rating
            :model-value="averageRating"
            readonly
            color="yellow-darken-3"
            background-color="grey-lighten-1"
            half-increments
            length="5"
            size="18"
          />
          <span class="ml-2 text-body-2 text-grey">
            {{ averageRating.toFixed(1) }} ({{ reviewCount }} {{ $t('reviews') }})
          </span>
        </div>
      </div>
    </v-card-text>
    <v-card-actions v-if="isAdmin" class="d-flex">
      <v-btn
        prepend-icon="mdi-pencil-outline"
        @click.stop="$emit('edit', product)"
        class="border border-grey-darken-4 text-capitalize flex-fill"
        elevation="0"
      >
        {{ $t('edit') }}
      </v-btn>
      <v-btn
        color="error"
        prepend-icon="mdi-delete-outline"
        @click.stop="product.id ? $emit('delete', product.id) : null"
        class="border border-grey-darken-4 text-capitalize flex-fill"
        elevation="0"
      >
        {{ $t('delete') }}
      </v-btn>
    </v-card-actions>
    <v-card-actions v-else>
      <v-btn
        @click.stop="$emit('edit', product)"
        class="w-100 bg-blue text-capitalize font-weight-medium"
      >
        {{ $t('viewDetails') }}
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
  border-radius: 8px;
  transition: transform 0.3s ease;
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
