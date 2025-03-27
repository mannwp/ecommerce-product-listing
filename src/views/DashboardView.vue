<template>
  <v-container class="modern-container">
    <div class="d-flex justify-space-between">
      <h1 class="page-title">{{ $t('dashboard') }}</h1>
      <v-btn
        v-if="userRole === 'admin'"
        color="success"
        class="mb-4 add-button"
        @click="showAddForm"
      >
        {{ $t('addProduct') }}
      </v-btn>
    </div>
    <v-row>
      <v-col v-for="product in products" :key="product.id" cols="12" sm="6" md="4">
        <product-card
          :product="product"
          :is-admin="userRole === 'admin'"
          @edit="editProduct"
          @delete="deleteProductHandler"
        />
      </v-col>
    </v-row>
    <v-dialog v-model="showForm" max-width="600px">
      <product-form
        :initial-product="selectedProduct"
        @submit="handleFormSubmit"
        @close="closeForm"
      />
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useProductStore } from '../stores/productStore'
import ProductCard from '../components/ProductCard.vue'
import ProductForm from '../components/ProductForm.vue'
// import { useI18n } from 'vue-i18n';
import { auth, db } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, onSnapshot, type Unsubscribe } from 'firebase/firestore'
import type { Product } from '../types/product'

// const { t } = useI18n();
const productStore = useProductStore()
const { products, fetchProducts, deleteProduct } = productStore

const userRole = ref<string | null>(null)
let unsubscribeUserRole: Unsubscribe | null = null

const showForm = ref(false)
const selectedProduct = ref<Product | null>(null)

onMounted(async () => {
  await fetchProducts()
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid)
      unsubscribeUserRole = onSnapshot(
        userDocRef,
        (docSnap) => {
          if (docSnap.exists()) {
            userRole.value = docSnap.data().role
          } else {
            userRole.value = null
          }
        },
        (error) => {
          console.error('Error fetching user role:', error)
          userRole.value = null
        },
      )
    } else {
      userRole.value = null
      if (unsubscribeUserRole) {
        unsubscribeUserRole()
        unsubscribeUserRole = null
      }
    }
  })
})

onUnmounted(() => {
  if (unsubscribeUserRole) {
    unsubscribeUserRole()
  }
})

const showAddForm = () => {
  selectedProduct.value = null
  showForm.value = true
}

const editProduct = (product: Product) => {
  selectedProduct.value = product
  showForm.value = true
}

const deleteProductHandler = async (id: string) => {
  try {
    await deleteProduct(id)
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error deleting product:', error.message)
    } else {
      console.error('Error deleting product:', error)
    }
  }
}

const handleFormSubmit = async (updatedProduct: Product) => {
  try {
    await productStore.addOrUpdate(updatedProduct)
    closeForm()
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error submitting form:', error.message)
    } else {
      console.error('Error submitting form:', error)
    }
  }
}

const closeForm = () => {
  showForm.value = false
  selectedProduct.value = null
}
</script>

<style scoped>
.modern-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  text-align: start;
}

.add-button {
  border-radius: 8px;
  text-transform: none;
  font-weight: 600;
  background: linear-gradient(90deg, #4caf50, #66bb6a);
  transition:
    background 0.3s ease,
    transform 0.2s ease;
}

.add-button:hover {
  background: linear-gradient(90deg, #66bb6a, #4caf50);
  transform: translateY(-2px);
}

@media (max-width: 600px) {
  .modern-container {
    padding: 1rem;
  }

  .page-title {
    font-size: 1.5rem;
  }
}
</style>
