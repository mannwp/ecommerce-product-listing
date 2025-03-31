<!-- src/components/ProductForm.vue -->
<template>
  <v-card class="modern-card">
    <v-card-title class="form-title">
      {{ initialProduct ? $t('editProduct') : $t('addProduct') }}
    </v-card-title>
    <v-card-text>
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
        <v-btn color="error" class="w-100 mt-2" @click="$emit('close')">
          {{ $t('cancel') }}
        </v-btn>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useProductStore } from '../stores/productStore'
import { useI18n } from 'vue-i18n'
import type { VForm } from 'vuetify/components'
import type { Product } from '../types/product'

const { t } = useI18n()
const emit = defineEmits<{
  (e: 'submit', updatedProduct: Product): void
  (e: 'close'): void
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

const translatedCategories = computed(() =>
  categories.value.map((cat) => ({
    text: t(cat.toLowerCase()),
    value: cat,
  })),
)
const translatedStockOptions = computed(() => [
  { text: t('inStock'), value: 'In Stock' },
  { text: t('outOfStock'), value: 'Out of Stock' },
])

const requiredRule = [(v: unknown) => !!v || t('required')]
const nameRules = [...requiredRule, (v: string) => v.length <= 100 || t('max100')]
const priceRules = [...requiredRule, (v: number) => v > 0 || t('positive')]
const computedImageRules = computed(() => [
  () =>
    (imageFiles.value && imageFiles.value.length > 0) ||
    form.value.images.length > 0 ||
    t('imageRequired'),
  (v: File[] | null) =>
    !v || v.every((file) => file.size <= 2 * 1024 * 1024) || t('imageSizeLimit'),
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
  if (files) {
    const fileArray = Array.isArray(files) ? files : [files]
    imagePreviews.value = await Promise.all(fileArray.map((file) => fileToBase64(file)))
    form.value.images = imagePreviews.value
  } else {
    imagePreviews.value = form.value.images || []
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
    const updatedProduct = {
      ...form.value,
      // id: initialProduct?.id || Math.random().toString(36).substr(2, 9),
    }
    // Remove the id for new products to let Firestore generate it
    if (!initialProduct && 'id' in updatedProduct) {
      // @ts-expect-error - id is optional in Product type
      delete updatedProduct.id
    }
    emit('submit', updatedProduct)
    formRef.value!.reset()
    imagePreviews.value = []
  }
}

const { initialProduct } = defineProps<{
  initialProduct?: Product | null
}>()
</script>

<style scoped>
.modern-card {
  border-radius: 12px;
}

.form-title {
  font-size: 1.5rem;
  font-weight: 600;
  text-align: center;
  padding: 1rem;
}

.w-100 {
  width: 100%;
  border-radius: 8px;
  text-transform: none;
  font-weight: 600;
  margin-top: 0.5rem;
}

.w-100[color='success'] {
  background: linear-gradient(90deg, #4caf50, #66bb6a);
  transition:
    background 0.3s ease,
    transform 0.2s ease;
}

.w-100[color='success']:hover {
  background: linear-gradient(90deg, #66bb6a, #4caf50);
  transform: translateY(-2px);
}
</style>
