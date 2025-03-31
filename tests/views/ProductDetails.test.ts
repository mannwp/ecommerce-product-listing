import { mount } from '@vue/test-utils'
import { expect, test, vi, type Mock } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'
import { setActivePinia, createPinia } from 'pinia'
import ProductDetails from '../../src/views/ProductDetails.vue'
import { useProductStore } from '../../src/stores/productStore'
import type { Product } from '../../src/types/product'
import type { Review } from '../../src/types/review'
import type { Timestamp } from 'firebase/firestore'
// import { User } from 'firebase/auth'

// Mock Firebase Firestore
vi.mock('firebase/firestore', () => {
  const mockGetDoc = vi.fn()
  const mockAddDoc = vi.fn()
  const mockOnSnapshot = vi.fn()
  const mockQuery = vi.fn()
  const mockCollection = vi.fn()
  const mockDoc = vi.fn()
  const mockOrderBy = vi.fn()

  return {
    getFirestore: vi.fn(() => ({})),
    collection: mockCollection,
    doc: mockDoc,
    query: mockQuery,
    getDoc: mockGetDoc,
    addDoc: mockAddDoc,
    orderBy: mockOrderBy,
    onSnapshot: mockOnSnapshot,
    Timestamp: {
      fromDate: (date: Date) => ({ toDate: () => date }),
    },
  }
})

// Mock Firebase Auth
vi.mock('firebase/auth', () => {
  const mockOnAuthStateChanged = vi.fn()
  return {
    getAuth: vi.fn(() => ({})),
    onAuthStateChanged: mockOnAuthStateChanged,
  }
})

// Mock the router with createMemoryHistory
const routes = [
  { path: '/', name: 'product-listing', component: { template: '<div></div>' } },
  { path: '/product/:id', name: 'product-details', component: ProductDetails },
  { path: '/login', name: 'login', component: { template: '<div>Login</div>' } },
]
const router = createRouter({
  history: createMemoryHistory(), // Use createMemoryHistory for testing
  routes,
})
// test('product details allows authenticated users to submit a review and calls addReview with correct data', async () => {
//   // Set up Pinia
//   const pinia = createPinia()
//   setActivePinia(pinia)

//   const product: Product = {
//     id: '1',
//     name: 'Test Product',
//     price: 99.99,
//     category: 'Electronics' as const,
//     stockStatus: 'In Stock' as const,
//     images: ['https://example.com/image.jpg'],
//   }

//   const productStore = useProductStore()
//   // Mock fetchProduct to load the product
//   productStore.fetchProduct = vi.fn().mockResolvedValue(product)
//   // Mock addReview to spy on its calls
//   productStore.addReview = vi.fn().mockResolvedValue(undefined)

//   const mockUser = {
//     uid: '5dAmAYZMowWss5lB8Pf9PSNJyKp1',
//     email: 'mann.wappnet@gmail.com',
//   }

//   const { onAuthStateChanged } = await import('firebase/auth')
//   ;(onAuthStateChanged as Mock).mockImplementation((auth: any, callback: (user: any) => void) => {
//     callback(mockUser)
//     return vi.fn()
//   })

//   // Ensure the router is ready and navigated to the correct route
//   await router.push({ name: 'product-details', params: { id: '1' } })
//   await router.isReady()

//   const wrapper = mount(ProductDetails, {
//     global: {
//       plugins: [router, pinia],
//     },
//   })

//   // Wait for the component to render the product
//   await wrapper.vm.$nextTick()
//   await wrapper.vm.$nextTick()
//   await vi.waitFor(() => {
//     expect(wrapper.text()).toContain('Test Product')
//   })

//   // Simulate user interaction: set rating and review text
//   const ratingButtons = wrapper.findAll('#testRating button')
//   expect(ratingButtons.length).toBe(5)
//   await ratingButtons[3].trigger('click') // Select 4 stars
//   await wrapper.vm.$nextTick()

//   const reviewTextarea = wrapper.find('#review-textarea')
//   expect(reviewTextarea.exists()).toBe(true)
//   await reviewTextarea.setValue('This is a test review')
//   await wrapper.vm.$nextTick()

//   // Simulate form submission
//   const submitBtn = wrapper.find('button[type="submit"]')
//   expect(submitBtn.exists()).toBe(true)
//   await submitBtn.trigger('click')
//   await wrapper.vm.$nextTick()

//   // Verify that addReview was called with the correct data
//   expect(productStore.addReview).toHaveBeenCalledWith('1', {
//     userId: mockUser.uid,
//     email: mockUser.email,
//     rating: 4,
//     reviewText: 'This is a test review',
//   })
// })
test('product details renders product details', async () => {
  // Set up Pinia
  const pinia = createPinia()
  setActivePinia(pinia)

  const product: Product = {
    id: '1',
    name: 'Test Product',
    price: 99.99,
    category: 'Electronics' as const,
    stockStatus: 'In Stock' as const,
    images: ['https://example.com/image.jpg'],
  }

  const reviews: Review[] = [
    {
      id: 'r1',
      userId: 'u1',
      email: 'user@example.com',
      rating: 4,
      reviewText: 'Great product!',
      createdAt: { toDate: () => new Date('2023-01-01') } as Timestamp,
    },
  ]

  // Mock Firestore getDoc
  const { getDoc } = await import('firebase/firestore')
  ;(getDoc as Mock).mockResolvedValue({
    exists: () => true,
    id: '1',
    data: () => product,
  })

  // Mock Firestore onSnapshot for reviews
  const { onSnapshot } = await import('firebase/firestore')
  ;(onSnapshot as Mock).mockImplementation((query, callback) => {
    callback({
      docs: reviews.map((review) => ({
        id: review.id,
        data: () => review,
      })),
      forEach: (cb: (doc: { id: string; data: () => Review }) => void) =>
        reviews.forEach((review) => cb({ id: review.id, data: () => review })),
    })
    return vi.fn() // Mock unsubscribe function
  })

  // Mock the product store
  const productStore = useProductStore()
  productStore.fetchProduct = vi.fn().mockResolvedValue(product)
  productStore.getReviews = vi.fn().mockReturnValue(reviews)
  productStore.getAverageRating = vi.fn().mockReturnValue(4.0)
  productStore.fetchReviewsForProduct = vi.fn().mockReturnValue(vi.fn())

  // Mock authentication (unauthenticated)
  const { onAuthStateChanged } = await import('firebase/auth')
  ;(onAuthStateChanged as Mock).mockImplementation((auth, callback) => {
    callback(null)
    return vi.fn()
  })

  // Mock route params
  await router.push('/product/1')

  const wrapper = mount(ProductDetails, {
    global: {
      plugins: [router, pinia],
    },
  })

  // Wait for the component to render
  await vi.waitFor(
    () => {
      expect(wrapper.text()).toContain('Test Product')
      expect(wrapper.text()).toContain('$99.99 | Electronics')
      expect(wrapper.text()).toContain('In Stock')
    },
    { timeout: 3000 },
  )
})

test('product details displays review summary', async () => {
  // Set up Pinia
  const pinia = createPinia()
  setActivePinia(pinia)

  const product: Product = {
    id: '1',
    name: 'Test Product',
    price: 99.99,
    category: 'Electronics' as const,
    stockStatus: 'In Stock' as const,
    images: ['https://example.com/image.jpg'],
  }

  const reviews: Review[] = [
    {
      id: 'r1',
      userId: 'u1',
      email: 'user@example.com',
      rating: 4,
      reviewText: 'Great product!',
      createdAt: { toDate: () => new Date('2023-01-01') } as Timestamp,
    },
  ]

  // Mock Firestore getDoc
  const { getDoc } = await import('firebase/firestore')
  ;(getDoc as Mock).mockResolvedValue({
    exists: () => true,
    id: '1',
    data: () => product,
  })

  // Mock Firestore onSnapshot for reviews
  const { onSnapshot } = await import('firebase/firestore')
  ;(onSnapshot as Mock).mockImplementation((query, callback) => {
    callback({
      docs: reviews.map((review) => ({
        id: review.id,
        data: () => review,
      })),
      forEach: (cb: (doc: { id: string; data: () => Review }) => void) =>
        reviews.forEach((review) => cb({ id: review.id, data: () => review })),
    })
    return vi.fn()
  })

  // Mock the product store
  const productStore = useProductStore()
  productStore.fetchProduct = vi.fn().mockResolvedValue(product)
  productStore.getReviews = vi.fn().mockReturnValue(reviews)
  productStore.getAverageRating = vi.fn().mockReturnValue(4.0)
  productStore.fetchReviewsForProduct = vi.fn().mockReturnValue(vi.fn())

  // Mock authentication (unauthenticated)
  const { onAuthStateChanged } = await import('firebase/auth')
  ;(onAuthStateChanged as Mock).mockImplementation((auth, callback) => {
    callback(null)
    return vi.fn()
  })

  // Mock route params
  await router.push('/product/1')

  const wrapper = mount(ProductDetails, {
    global: {
      plugins: [router, pinia],
    },
  })

  // Wait for the component to render
  await vi.waitFor(
    () => {
      expect(wrapper.text()).toContain('4.0 (1 Reviews)')
      expect(wrapper.text()).toContain('Recent Review - user@example.com')
      expect(wrapper.text()).toContain('Great product!')
    },
    { timeout: 3000 },
  )
})

test('product details shows login prompt for unauthenticated users', async () => {
  // Set up Pinia
  const pinia = createPinia()
  setActivePinia(pinia)

  const product: Product = {
    id: '1',
    name: 'Test Product',
    price: 99.99,
    category: 'Electronics' as const,
    stockStatus: 'In Stock' as const,
    images: ['https://example.com/image.jpg'],
  }

  // Mock Firestore getDoc
  const { getDoc } = await import('firebase/firestore')
  ;(getDoc as Mock).mockResolvedValue({
    exists: () => true,
    id: '1',
    data: () => product,
  })

  // Mock Firestore onSnapshot for reviews
  const { onSnapshot } = await import('firebase/firestore')
  ;(onSnapshot as Mock).mockImplementation((query, callback) => {
    callback({
      docs: [],
      // forEach: (cb: (doc: unknown) => void) => [], // Add forEach to match expected behavior
    })
    return vi.fn()
  })

  // Mock the product store
  const productStore = useProductStore()
  productStore.fetchProduct = vi.fn().mockResolvedValue(product)
  productStore.getReviews = vi.fn().mockReturnValue([])
  productStore.getAverageRating = vi.fn().mockReturnValue(0)
  productStore.fetchReviewsForProduct = vi.fn().mockReturnValue(vi.fn())

  // Mock authentication (unauthenticated)
  const { onAuthStateChanged } = await import('firebase/auth')
  ;(onAuthStateChanged as Mock).mockImplementation((auth, callback) => {
    if (typeof callback === 'function') {
      callback(null)
    }
    return vi.fn()
  })

  // Mock route params
  await router.push('/product/1')

  const wrapper = mount(ProductDetails, {
    global: {
      plugins: [router, pinia],
    },
  })

  // Wait for the component to render
  await vi.waitFor(
    () => {
      expect(wrapper.text()).toContain('Log in to submit a review')
      expect(wrapper.text()).toContain('Login')
    },
    { timeout: 3000 },
  )
})

// test('product details allows authenticated users to submit a review', async () => {
//   // Set up Pinia
//   const pinia = createPinia()
//   setActivePinia(pinia)

//   const product: Product = {
//     id: '1',
//     name: 'Test Product',
//     price: 99.99,
//     category: 'Electronics' as const,
//     stockStatus: 'In Stock' as const,
//     images: ['https://example.com/image.jpg'],
//   }
//   // reviews = []; // Reset reviews array before each test
//   let reviews: any[] = []; // Dynamic reviews array to simulate Firestore data
//   // Mock Firestore getDoc
//   const { getDoc } = await import('firebase/firestore')
//   ;(getDoc as Mock).mockResolvedValue({
//     exists: () => true,
//     id: '1',
//     data: () => product,
//   })

//   // Mock Firestore onSnapshot
//   // let snapshotCallback: (snapshot: any) => void;
//   const { onSnapshot } = await import('firebase/firestore')
//   ;(onSnapshot as Mock).mockImplementation((query, callback) => {
//     // snapshotCallback = callback;
//     // Initial snapshot with current reviews
//     callback({
//       docs: reviews.map((review) => ({
//         id: review.id,
//         data: () => review,
//       })),
//       forEach: (cb: (doc: any) => void) => reviews.forEach((r) => cb({ id: r.id, data: () => r })),
//     });
//     return vi.fn(); // Mock unsubscribe function
//   })

//   // Mock product store
//   const productStore = useProductStore()
//   productStore.fetchProduct = vi.fn().mockResolvedValue(product)
//   productStore.getReviews = vi.fn().mockReturnValue([])
//   productStore.getAverageRating = vi.fn().mockReturnValue(0)
//   productStore.fetchReviewsForProduct = vi.fn().mockReturnValue(vi.fn())
//   productStore.addReview = vi.fn().mockResolvedValue(undefined)

//   // Mock authenticated user
//   const mockUser = {
//     uid: '5dAmAYZMowWss5lB8Pf9PSNJyKp1',
//     email: 'mann.wappnet@gmail.com',
//   }

//   const { onAuthStateChanged } = await import('firebase/auth')
//   ;(onAuthStateChanged as Mock).mockImplementation((auth, callback) => {
//     callback(mockUser)
//     return vi.fn()
//   })

//   await router.push('/product/1')

//   const wrapper = mount(ProductDetails, {
//     global: {
//       plugins: [router, pinia],
//     },
//   })

//   // Wait for component to mount and async operations to complete
//   await wrapper.vm.$nextTick()
//   await vi.waitFor(() => {
//     expect(wrapper.text()).toContain('Test Product')
//   })

//   // Simulate rating
//   //   const ratingComponent = wrapper.findComponent({ name: 'v-rating' })
//   //   expect(ratingComponent.exists()).toBe(true)
//   //   await ratingComponent.vm.$emit('update:modelValue', 4)
//   //   await wrapper.vm.$nextTick()

//   // Check the modelValue (newReview.rating in ProductDetails)
//   //   const newReview = (wrapper.vm as any).newReview
//   //   expect(newReview.rating).toBe(4) // Verify the rating in the component's data
//   const ratingButtons = wrapper.findAll('#testRating button')
//   expect(ratingButtons.length).toBe(5) // 5 stars in the v-rating component
//   await ratingButtons[3].trigger('click') // Click the 4th star (index 3, value 4)
//   await wrapper.vm.$nextTick()

//   const selectedbuttons = wrapper.findAll('#testRating .mdi-star-outline')
//   expect(selectedbuttons.length).toBe(1)

//   // Find textarea and set value
//   const reviewTextarea = wrapper.find('#review-textarea')
//   expect(reviewTextarea.exists()).toBe(true)
//   await reviewTextarea.setValue('This is a test review')
//   await wrapper.vm.$nextTick()

//   // Submit the review
//   const submitBtn = wrapper.find('button[type="submit"]')
//   expect(submitBtn.exists()).toBe(true)
//   await submitBtn.trigger('click')
//   await wrapper.vm.$nextTick()

//   // Wait for the component to update
//   await vi.waitFor(
//     () => {
//       expect(wrapper.text()).toContain('This is a test review')
//     },
//     { timeout: 3000 },
//   )
// })

test('product details handles product not found', async () => {
  // Set up Pinia
  const pinia = createPinia()
  setActivePinia(pinia)

  // Mock Firestore getDoc to simulate product not found
  const { getDoc } = await import('firebase/firestore')
  ;(getDoc as Mock).mockResolvedValue({
    exists: () => false,
  })

  // Mock the product store
  const productStore = useProductStore()
  productStore.fetchProduct = vi.fn().mockRejectedValue(new Error('Product not found'))
  productStore.getReviews = vi.fn().mockReturnValue([])
  productStore.getAverageRating = vi.fn().mockReturnValue(0)
  productStore.fetchReviewsForProduct = vi.fn().mockReturnValue(vi.fn())

  // Mock authentication (unauthenticated)
  const { onAuthStateChanged } = await import('firebase/auth')
  ;(onAuthStateChanged as Mock).mockImplementation((auth, callback) => {
    if (typeof callback === 'function') {
      callback(null)
    }
    return vi.fn()
  })

  // Mock route params
  await router.push('/product/1')

  const wrapper = mount(ProductDetails, {
    global: {
      plugins: [router, pinia],
    },
  })

  // Wait for the component to render
  await vi.waitFor(
    () => {
      expect(wrapper.text()).toContain('Product not found')
    },
    { timeout: 3000 },
  )
})
