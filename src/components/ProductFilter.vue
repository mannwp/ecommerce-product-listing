<template>
  <v-row class="mb-4">
    <v-col cols="12" sm="4">
      <v-select
        v-model="localFilters.category"
        :items="categoryOptions"
        label="Filter by Category"
        prepend-icon="mdi-filter"
      />
    </v-col>
    <v-col cols="12" sm="4">
      <v-select
        v-model="localFilters.sortBy"
        :items="sortByOptions"
        label="Sort By"
        prepend-icon="mdi-sort"
      />
    </v-col>
    <v-col cols="12" sm="4">
      <v-select
        v-model="localFilters.sortOrder"
        :items="sortOrderOptions"
        label="Sort Order"
        prepend-icon="mdi-sort-variant"
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useProductStore } from '@/stores/productStore'

defineProps<{
  modelValue: {
    category: string
    sortBy: 'price' | 'name'
    sortOrder: 'asc' | 'desc'
  }
}>()

// Define emits for v-model updates
const emit = defineEmits<{
  (e: 'update:modelValue', value: typeof filters.value): void
}>()

const productStore = useProductStore()
const { categories } = productStore

const categoryOptions = ref([
  { title: 'All', value: '' },
  ...categories.map((category) => ({ title: category, value: category })),
])

const filters = ref({
  category: '',
  sortBy: 'price' as const,
  sortOrder: 'asc' as const,
})

// Two-way binding with localFilters
const localFilters = ref({ ...filters.value })

// Sync prop changes to local state
watch(
  () => filters.value,
  (newValue) => {
    emit('update:modelValue', newValue)
  },
  { deep: true },
)

// Sync local state with filter changes
watch(
  () => localFilters.value,
  (newValue) => {
    filters.value = { ...newValue }
  },
  { deep: true },
)

// Options for sort selects
const sortByOptions = [
  { title: 'Price', value: 'price' },
  { title: 'Name', value: 'name' },
]

const sortOrderOptions = [
  { title: 'Ascending', value: 'asc' },
  { title: 'Descending', value: 'desc' },
]
</script>
