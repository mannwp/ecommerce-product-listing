<template>
  <v-container>
    <v-row class="mb-4" align="center" justify="space-between">
      <v-col cols="12" sm="auto">
        <h1>{{ $t('dashboard') }}</h1>
      </v-col>
      <v-col cols="12" sm="auto">
        <v-btn color="success" @click="showAddForm">{{ $t('addProduct') }}</v-btn>
      </v-col>
    </v-row>

    <!-- Add Product Dialog -->
    <v-dialog v-model="showAddDialog" max-width="600">
      <v-card>
        <v-card-title>{{ $t('addProduct') }}</v-card-title>
        <v-card-text>
          <product-form @submit="hideAddForm" />
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Edit Product Dialog -->
    <v-dialog v-model="showEditDialog" max-width="600">
      <v-card>
        <v-card-title>{{ $t('editProduct') }}</v-card-title>
        <v-card-text>
          <product-form :initial-product="initialProduct" @submit="updateProduct" />
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-row>
      <v-col v-for="product in products" :key="product.id" cols="12" sm="6" md="4">
        <product-card
          :product="product"
          :is-admin="true"
          @edit="showEditForm"
          @delete="deleteProduct"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useProductStore } from '@/stores/productStore'
import ProductForm from '@/components/ProductForm.vue'
import ProductCard from '@/components/ProductCard.vue'
import type { Product } from '@/types/product'

const productStore = useProductStore()
const { removeProduct } = productStore
const products = computed(() => productStore.products)

const showAddDialog = ref(false)
const showEditDialog = ref(false)
const selectedProduct = ref<Product | null>(null)
const initialProduct = computed(() => selectedProduct.value || undefined)

const showAddForm = () => {
  showAddDialog.value = true
}

const hideAddForm = () => {
  showAddDialog.value = false
}

const showEditForm = (product: Product) => {
  selectedProduct.value = { ...product }
  showEditDialog.value = true
}

const updateProduct = (updatedProduct: Product) => {
  console.log('Received updated product:', updatedProduct)
  productStore.updateProduct(updatedProduct)
  showEditDialog.value = false
  selectedProduct.value = null
}

const deleteProduct = (id: string) => {
  removeProduct(id)
}
</script>
