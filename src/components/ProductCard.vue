<template>
  <v-card class="">
    <v-img :src="product.image" height="250" />
    <v-card-title>{{ product.name }}</v-card-title>
    <v-card-subtitle>
      ${{ product.price }} | {{ $t(product.category.toLowerCase()) }}
    </v-card-subtitle>
    <v-card-text>
      <v-chip :color="product.stockStatus === 'In Stock' ? 'green' : 'red'" small>
        {{ $t(product.stockStatus === 'In Stock' ? 'inStock' : 'outOfStock') }}
      </v-chip>
    </v-card-text>
    <v-card-actions v-if="isAdmin">
      <v-btn color="primary" @click="$emit('edit', product)">{{ $t('editProduct') }}</v-btn>
      <v-btn color="error" @click="$emit('delete', product.id)">{{ $t('delete') }}</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import type { Product } from '@/types/product'

defineProps<{ product: Product; isAdmin?: boolean }>()
defineEmits<{ (e: 'edit', product: Product): void; (e: 'delete', id: string): void }>()
</script>
