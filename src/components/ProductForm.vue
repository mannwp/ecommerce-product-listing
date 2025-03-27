<template>
  <v-form
    v-model="formValid"
    @submit.prevent="submitForm"
    ref="formRef"
    class="d-flex flex-column ga-2"
  >
    <v-text-field
      variant="outlined"
      v-model="form.name"
      :label="$t('name')"
      :rules="nameRules"
      required
    />
    <v-text-field
      variant="outlined"
      v-model.number="form.price"
      :label="$t('price')"
      type="number"
      :rules="priceRules"
      required
    />
    <v-select
      variant="outlined"
      v-model="form.category"
      :items="translatedCategories"
      item-title="text"
      item-value="value"
      :label="$t('category')"
      :rules="requiredRule"
      required
    />
    <v-file-input
      v-model="imageFiles"
      :label="$t('image')"
      accept="image/*"
      prepend-icon="mdi-camera"
      variant="filled"
      multiple
      @update:modelValue="handleFileInput"
      :rules="computedImageRules"
    />
    <v-row v-if="imagePreviews.length" class="my-2">
      <v-col v-for="(preview, index) in imagePreviews" :key="index" cols="4">
        <v-img :src="preview" max-height="100" />
      </v-col>
    </v-row>
    <v-select
      variant="outlined"
      v-model="form.stockStatus"
      :items="translatedStockOptions"
      item-title="text"
      item-value="value"
      :label="$t('stockStatus')"
      :rules="requiredRule"
      required
    />
    <v-btn type="submit" color="success" class="w-100" :disabled="!formValid">
      {{ initialProduct ? $t('editProduct') : $t('addProduct') }}
    </v-btn>
  </v-form>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useProductStore } from '@/stores/productStore'
import { useI18n } from 'vue-i18n'
import type { VForm } from 'vuetify/components'
import type { Product } from '../types/product'

const { t } = useI18n()
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
  images: [],
  stockStatus: 'In Stock',
})
const imageFiles = ref<File[]>([])
const imagePreviews = ref<string[]>([])
const formValid = ref(false)
const formRef = ref<VForm | null>(null)
// Translated select options
const translatedCategories = computed(() =>
  categories.map((cat) => ({
    text: t(cat.toLowerCase()),
    value: cat,
  })),
)
const translatedStockOptions = computed(() => [
  { text: t('inStock'), value: 'In Stock' },
  { text: t('outOfStock'), value: 'Out of Stock' },
])
// Validation rules with translated messages
const requiredRule = [(v: unknown) => !!v || t('required')]
const nameRules = [...requiredRule, (v: string) => v.length <= 100 || t('max100')]
const priceRules = [...requiredRule, (v: number) => v > 0 || t('positive')]
const computedImageRules = computed(() => [
  // Ensure at least one image is present (either uploaded or already in form.images)
  () =>
    (imageFiles.value && imageFiles.value.length > 0) ||
    form.value.images.length > 0 ||
    t('imageRequired'),
  // Validate image size (2MB limit)
  (v: File[] | null) =>
    !v || v.every((file) => file.size <= 2 * 1024 * 1024) || t('imageSizeLimit'),
  // Validate image type
  (v: File[] | null) => !v || v.every((file) => file.type.startsWith('image/')) || t('imageType'),
])
watch(
  () => initialProduct,
  (newProduct) => {
    if (newProduct) {
      form.value = { ...newProduct }
      imagePreviews.value = newProduct.images || []
      imageFiles.value = []
    }
  },
  { immediate: true },
)

const handleFileInput = async (files: File | File[] | null) => {
  if (files instanceof File) {
    files = [files]
  }
  if (files && files.length > 0) {
    imagePreviews.value = await Promise.all(files.map((file) => fileToBase64(file)))
    form.value.images = imagePreviews.value
  } else if (initialProduct?.images && !imageFiles.value.length) {
    imagePreviews.value = initialProduct.images
    form.value.images = initialProduct.images
  } else {
    imagePreviews.value = []
    form.value.images = []
  }
}
const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.readAsDataURL(file)
  })

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
    imagePreviews.value = []
  }
}
const { initialProduct } = defineProps<{
  initialProduct?: Product
}>()
</script>
