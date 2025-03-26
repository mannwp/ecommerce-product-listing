<template>
  <v-form v-model="formValid" @submit.prevent="submitForm" ref="formRef">
    <v-text-field v-model="form.name" :label="$t('name')" :rules="nameRules" required />
    <v-text-field
      v-model.number="form.price"
      :label="$t('price')"
      type="number"
      :rules="priceRules"
      required
    />
    <v-select
      v-model="form.category"
      :items="translatedCategories"
      item-title="text"
      item-value="value"
      :label="$t('category')"
      :rules="requiredRule"
      required
    />
    <v-file-input
      v-model="imageFile"
      :label="$t('image')"
      accept="image/*"
      prepend-icon="mdi-camera"
      variant="filled"
      @update:modelValue="handleFileInput"
      :rules="computedImageRules"
    />
    <v-img v-if="imagePreview" :src="imagePreview" max-height="200" class="my-2" />
    <v-select
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
  image: '',
  stockStatus: 'In Stock',
})

const imageFile = ref<File | null>(null)
const imagePreview = ref('')
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
  (v: File | null) => (initialProduct ? !!v || !!form.value.image : !!v) || t('imageRequired'),
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
    imagePreview.value = ''
  }
}

const { initialProduct } = defineProps<{
  initialProduct?: Product
}>()
</script>
