<template>
  <v-container>
    <product-filter v-model="filters" />
    <v-row>
      <v-col v-for="product in filteredProducts" :key="product.id" cols="12" sm="6" md="4">
        <product-card :product="product" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useProductStore } from '@/stores/productStore'
import ProductCard from '@/components/ProductCard.vue'
import ProductFilter from '@/components/ProductFilter.vue'

const productStore = useProductStore()

const filters = ref({
  category: '',
  sortBy: 'price' as 'price' | 'name',
  sortOrder: 'asc' as 'asc' | 'desc',
})

const filteredProducts = computed(() => {
  let result = [...productStore.products]

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
</script>
