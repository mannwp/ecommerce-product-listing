// src/store/productStore.ts
import { ref } from 'vue'
import { db } from '../firebase'
import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore'
import type { Product } from '../types/product'
import type { Review } from '../types/review'
export const useProductStore = () => {
  const products = ref<Product[]>([])
  const categories = ref<string[]>(['Electronics', 'Clothing', 'Books', 'Home'])

  const reviewsMap = ref<{ [productId: string]: Review[] }>({})
  // Fetch all products
  const fetchProducts = async () => {
    try {
      const productsRef = collection(db, 'products')
      const productsQuery = query(productsRef)
      const querySnapshot = await getDocs(productsQuery)
      products.value = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[]
    } catch (error) {
      console.error('Error fetching products:', error)
      throw error
    }
  }

  // Fetch a single product by ID
  const fetchProduct = async (productId: string) => {
    try {
      const productDocRef = doc(db, 'products', productId)
      const productDoc = await getDoc(productDocRef)
      if (productDoc.exists()) {
        return { id: productDoc.id, ...productDoc.data() } as Product
      } else {
        throw new Error('Product not found')
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      throw error
    }
  }

  // Fetch reviews for a specific product
  const fetchReviewsForProduct = (productId: string) => {
    const reviewsRef = collection(db, 'products', productId, 'reviews')
    const reviewsQuery = query(reviewsRef, orderBy('createdAt', 'desc'))

    return onSnapshot(
      reviewsQuery,
      (snapshot) => {
        reviewsMap.value[productId] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Review[]
      },
      (error) => {
        console.error(`Error fetching reviews for product ${productId}:`, error)
      },
    )
  }

  // Fetch reviews for all products
  const fetchAllReviews = () => {
    const unsubscribeFunctions: Array<() => void> = []
    products.value.forEach((product) => {
      const unsubscribe = fetchReviewsForProduct(product.id)
      unsubscribeFunctions.push(unsubscribe)
    })
    return unsubscribeFunctions
  }

  // Get reviews for a specific product
  const getReviews = (productId: string): Review[] => {
    return reviewsMap.value[productId] || []
  }

  // Compute average rating for a specific product
  const getAverageRating = (productId: string): number => {
    const reviews = getReviews(productId)
    if (reviews.length === 0) return 0
    const total = reviews.reduce((sum: number, review: Review) => sum + review.rating, 0)
    return total / reviews.length
  }

  // Get review count for a specific product
  const getReviewCount = (productId: string): number => {
    return getReviews(productId).length
  }
  // Add a review for a product
  const addReview = async (productId: string, review: Omit<Review, 'id' | 'createdAt'>) => {
    try {
      const reviewsRef = collection(db, 'products', productId, 'reviews')
      const reviewData = {
        ...review,
        createdAt: new Date(),
      }
      await addDoc(reviewsRef, reviewData)
    } catch (error) {
      console.error('Error adding review:', error)
      throw error
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
    fetchProduct,
    fetchAllReviews,
    getAverageRating,
    fetchReviewsForProduct,
    getReviewCount,
    getReviews,
    addReview,
    reviewsMap,
  }
}
