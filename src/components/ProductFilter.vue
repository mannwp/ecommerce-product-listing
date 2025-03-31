<!-- src/components/ProductFilter.vue -->
<template>
  <!-- <v-row class="mb-0"> -->
  <v-col cols="12" sm="2">
    <v-select
      variant="outlined"
      v-model="localFilters.category"
      :items="categoryOptions"
      item-title="title"
      density="compact"
      item-value="value"
      :label="$t('filterByCategory')"
    />
  </v-col>
  <v-col cols="12" sm="2">
    <v-select
      variant="outlined"
      v-model="localFilters.sortBy"
      :items="sortByOptions"
      item-title="title"
      density="compact"
      item-value="value"
      :label="$t('sortBy')"
    />
  </v-col>
  <v-col cols="12" sm="2">
    <v-select
      variant="outlined"
      v-model="localFilters.sortOrder"
      :items="sortOrderOptions"
      item-title="title"
      density="compact"
      item-value="value"
      :label="$t('sortOrder')"
    />
  </v-col>
  <!-- </v-row> -->
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProductStore } from '@/stores/productStore'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  modelValue: {
    category: string
    sortBy: 'price' | 'name'
    sortOrder: 'asc' | 'desc'
  }
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: typeof localFilters.value): void
}>()

const productStore = useProductStore()
const { categories } = productStore

// Local filters for two-way binding
const localFilters = computed({
  get() {
    return props.modelValue
  },
  set(newValue) {
    emit('update:modelValue', newValue)
  },
})

// Reactive options that update with language changes
const categoryOptions = computed(() => [
  { title: t('all'), value: '' },
  ...categories.value.map((category) => ({ title: t(category.toLowerCase()), value: category })),
])

const sortByOptions = computed(() => [
  { title: t('price'), value: 'price' },
  { title: t('name'), value: 'name' },
])

const sortOrderOptions = computed(() => [
  { title: t('ascending'), value: 'asc' },
  { title: t('descending'), value: 'desc' },
])
</script>
