<!-- src/components/ProductCard.vue -->
<template>
  <v-card class="product-card" elevation="4">
    <v-img :src="product.images[0]" height="200" class="product-image" cover />
    <v-card-title class="product-title">{{ product.name }}</v-card-title>
    <v-card-subtitle class="product-subtitle">
      <span class="font-weight-bold text-black">${{ product.price }}</span> |
      {{ $t(product.category.toLowerCase()) }}
    </v-card-subtitle>
    <v-card-text>
      <v-chip
        :color="product.stockStatus === 'In Stock' ? 'green' : 'red'"
        :class="product.stockStatus === 'In Stock' ? 'in-stock' : 'out-of-stock'"
        small
      >
        {{ $t(product.stockStatus === 'In Stock' ? 'inStock' : 'outOfStock') }}
      </v-chip>
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
import type { Product } from '../types/product'

defineProps<{
  product: Product
  isAdmin?: boolean
}>()

defineEmits<{
  (e: 'edit', product: Product): void
  (e: 'delete', id: string): void
}>()
</script>

<style scoped>
/* Same styles as before */
</style>
