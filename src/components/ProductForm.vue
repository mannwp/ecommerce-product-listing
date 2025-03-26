<template>
  <v-form v-model="formValid" @submit.prevent="submitForm" ref="formRef">
    <v-text-field v-model="form.name" label="Product Name" :rules="nameRules" required />
    <v-text-field
      v-model.number="form.price"
      label="Price"
      type="number"
      :rules="priceRules"
      required
    />
    <v-select
      v-model="form.category"
      :items="categories"
      label="Category"
      :rules="requiredRule"
      required
    />
    <v-file-input
      v-model="imageFile"
      label="Product Image"
      accept="image/*"
      prepend-icon="mdi-camera"
      variant="filled"
      @update:modelValue="handleFileInput"
      :rules="computedImageRules"
    />
    <v-img v-if="imagePreview" :src="imagePreview" max-height="200" class="my-2" />
    <v-select
      v-model="form.stockStatus"
      :items="stockOptions"
      label="Stock Status"
      :rules="requiredRule"
      required
    />
    <v-btn type="submit" color="success" class="w-100" :disabled="!formValid">
      {{ initialProduct ? 'Update Product' : 'Add Product' }}
    </v-btn>
  </v-form>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useProductStore } from '@/stores/productStore'
import type { VForm } from 'vuetify/components'
import type { Product } from '@/types/product'

const emit = defineEmits<{
  (e: 'submit', updatedProduct: Product): void
}>()

const productStore = useProductStore()
const { categories } = productStore

const form = ref<Product>({
  id: '',
  name: '',
  price: 0,
  category: 'Electronics',
  image: '',
  stockStatus: 'In Stock',
})

const imageFile = ref<File | null>(null)
const imagePreview = ref('')
const stockOptions = ['In Stock', 'Out of Stock'] as const
const formValid = ref(false)
const formRef = ref<VForm | null>(null)

const requiredRule = [(v: unknown) => !!v || 'Required']
const nameRules = [...requiredRule, (v: string) => v.length <= 100 || 'Max 100 characters']
const priceRules = [...requiredRule, (v: number) => v > 0 || 'Must be positive']
const computedImageRules = computed(() => [
  (v: File | null) => {
    if (initialProduct) {
      return !!v || !!form.value.image || 'Image is required'
    }
    return !!v || 'Image is required'
  },
])

watch(
  () => initialProduct,
  (newProduct) => {
    if (newProduct) {
      form.value = { ...newProduct }
      imagePreview.value = newProduct.image
      imageFile.value = null
    }
  },
  { immediate: true },
)

const handleFileInput = async (files: File | File[] | null) => {
  const file = Array.isArray(files) ? files[0] : files
  if (file) {
    imagePreview.value = URL.createObjectURL(file)
    form.value.image = await fileToBase64(file)
  } else if (initialProduct?.image && !imageFile.value) {
    imagePreview.value = initialProduct.image
    form.value.image = initialProduct.image
  } else {
    imagePreview.value = ''
    form.value.image = ''
  }
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.readAsDataURL(file)
  })
}

const submitForm = async () => {
  const { valid } = await formRef.value!.validate()
  if (valid) {
    console.log('Form submitted with:', form.value)
    if (initialProduct) {
      productStore.updateProduct(form.value as Product)
      emit('submit', form.value as Product)
    } else {
      productStore.addProduct(form.value)
      emit('submit', { ...form.value, id: Math.random().toString(36).substr(2, 9) } as Product)
    }
    formRef.value!.reset()
    imagePreview.value = ''
  }
}

const { initialProduct } = defineProps<{
  initialProduct?: Product
}>()
</script>
