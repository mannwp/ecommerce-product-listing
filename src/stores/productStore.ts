import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Product } from '@/types/product'

export const useProductStore = defineStore(
  'product',
  () => {
    const products = ref<Product[]>([])
    const categories = ref(['Electronics', 'Clothing', 'Books', 'Home'] as const)

    const addProduct = (product: Omit<Product, 'id'>) => {
      products.value.push({
        ...product,
        id: Math.random().toString(36).substring(2, 9),
      })
    }

    const removeProduct = (id: string) => {
      products.value = products.value.filter((p) => p.id !== id)
    }

    const updateProduct = (updatedProduct: Product) => {
      const index = products.value.findIndex((p) => p.id === updatedProduct.id)
      if (index !== -1) {
        products.value[index] = { ...updatedProduct }
      }
    }

    return { products, categories, addProduct, removeProduct, updateProduct }
  },
  {
    persist: true,
  },
)
