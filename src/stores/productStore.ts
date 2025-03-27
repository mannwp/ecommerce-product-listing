// src/store/productStore.ts
import { ref } from 'vue'
import { db } from '../firebase'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import type { Product } from '../types/product'

export const useProductStore = () => {
  const products = ref<Product[]>([])
  const categories = ref<string[]>(['Electronics', 'Clothing', 'Books', 'Home'])

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'))
      products.value = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[]
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const addOrUpdate = async (product: Product) => {
    try {
      if (product.id) {
        // Update existing product
        const productRef = doc(db, 'products', product.id)
        // Remove the id field from the data to be updated
        const { ...productData } = product
        await updateDoc(productRef, productData)
      } else {
        // Add new product
        const { ...productData } = product // Ensure id is not included in the new document
        const newProductRef = await addDoc(collection(db, 'products'), productData)
        product.id = newProductRef.id
      }
      await fetchProducts() // Refresh the product list
    } catch (error) {
      console.error('Error adding/updating product:', error)
      throw error
    }
  }

  const deleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id))
      await fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      throw error
    }
  }

  return {
    products,
    categories,
    fetchProducts,
    addOrUpdate,
    deleteProduct,
  }
}
