// tests/views/HomeView.test.ts
import { mount } from '@vue/test-utils'
import { expect, test, vi, type Mock } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'
import { setActivePinia, createPinia } from 'pinia'
import HomeView from '../../src/views/HomeView.vue'
import { useProductStore } from '../../src/stores/productStore'
import type { Product } from '../../src/types/product'
import type { DocumentData, Query, QuerySnapshot } from 'firebase/firestore'

// Mock Firebase Firestore with proper typing
vi.mock('firebase/firestore', () => {
  // Mock getDocs with proper type
  const mockGetDocs =
    vi.fn<
      <AppModelType, DbModelType extends DocumentData>(
        query: Query<AppModelType, DbModelType>,
      ) => Promise<QuerySnapshot<AppModelType, DbModelType>>
    >()

  // Mock other Firestore methods
  const mockQuery = vi.fn()
  const mockCollection = vi.fn()
  const mockOrderBy = vi.fn() // Add orderBy mock
  const mockOnSnapshot = vi.fn() // Add onSnapshot mock

  return {
    getFirestore: vi.fn(() => ({})),
    collection: mockCollection,
    query: mockQuery,
    getDocs: mockGetDocs,
    orderBy: mockOrderBy, // Mock orderBy
    onSnapshot: mockOnSnapshot, // Mock onSnapshot
    Timestamp: {
      fromDate: (date: Date) => ({ toDate: () => date }),
    },
  }
})

// Mock the router
const routes = [
  { path: '/', name: 'product-listing', component: HomeView },
  { path: '/product/:id', name: 'product-details', component: { template: '<div></div>' } },
]
const router = createRouter({
  history: createWebHistory(),
  routes,
})

test('product listing renders page title', async () => {
  expect(HomeView).toBeTruthy()

  // Set up Pinia
  const pinia = createPinia()
  setActivePinia(pinia)

  // Mock Firestore getDocs
  const { getDocs } = await import('firebase/firestore')
  ;(getDocs as Mock).mockResolvedValue({
    docs: [],
    // forEach: (callback: (doc: { id: string; data: () => Product }) => void) => [],
  })

  const wrapper = mount(HomeView, {
    global: {
      plugins: [router, pinia],
    },
  })

  // Wait for the component to render
  await vi.waitFor(
    () => {
      expect(wrapper.text()).toContain('Product Listing')
    },
    { timeout: 3000 },
  )
})

test('product listing displays loading state', async () => {
  expect(HomeView).toBeTruthy()

  // Set up Pinia
  const pinia = createPinia()
  setActivePinia(pinia)

  // Mock Firestore getDocs to never resolve (simulate loading)
  const { getDocs } = await import('firebase/firestore')
  ;(getDocs as Mock).mockImplementation(() => new Promise(() => {}))

  const wrapper = mount(HomeView, {
    global: {
      plugins: [router, pinia],
    },
  })

  // Wait for the loading state to appear
  await vi.waitFor(
    () => {
      const progressCircular = wrapper.findComponent({ name: 'v-progress-circular' })
      expect(progressCircular.exists()).toBe(true)
    },
    { timeout: 3000 },
  )
})

test('product listing displays error state', async () => {
  expect(HomeView).toBeTruthy()

  // Set up Pinia
  const pinia = createPinia()
  setActivePinia(pinia)

  // Mock Firestore getDocs to reject (simulate error)
  const { getDocs } = await import('firebase/firestore')
  ;(getDocs as Mock).mockRejectedValue(new Error('Fetch error'))

  const wrapper = mount(HomeView, {
    global: {
      plugins: [router, pinia],
    },
  })

  // Wait for the error state to appear
  await vi.waitFor(
    () => {
      expect(wrapper.text()).toContain('Error fetching products')
    },
    { timeout: 3000 },
  )
})

test('product listing displays no products message', async () => {
  expect(HomeView).toBeTruthy()

  // Set up Pinia
  const pinia = createPinia()
  setActivePinia(pinia)

  // Mock Firestore getDocs to return an empty array
  const { getDocs } = await import('firebase/firestore')
  ;(getDocs as Mock).mockResolvedValue({
    docs: [],
    // forEach: (callback: (doc: unknown) => void) => [],
  })

  const wrapper = mount(HomeView, {
    global: {
      plugins: [router, pinia],
    },
  })

  // Wait for the "no products" message to appear
  await vi.waitFor(
    () => {
      expect(wrapper.text()).toContain('No products found')
    },
    { timeout: 3000 },
  )
})

test('product listing renders product cards', async () => {
  expect(HomeView).toBeTruthy()

  // Set up Pinia
  const pinia = createPinia()
  setActivePinia(pinia)

  // Mock Firestore getDocs to return products
  const products: Product[] = [
    {
      id: '1',
      name: 'Product 1',
      price: 99,
      category: 'Electronics' as const,
      stockStatus: 'In Stock' as const,
      images: ['https://example.com/image1.jpg'],
    },
    {
      id: '2',
      name: 'Product 2',
      price: 49,
      category: 'Clothing' as const,
      stockStatus: 'Out of Stock' as const,
      images: ['https://example.com/image2.jpg'],
    },
  ]

  const { getDocs, onSnapshot } = await import('firebase/firestore')
  ;(getDocs as Mock).mockResolvedValue({
    docs: products.map((product) => ({
      id: product.id,
      data: () => product,
    })),
    forEach: (callback: (doc: { id: string; data: () => Product }) => void) =>
      products.forEach((product) => callback({ id: product.id, data: () => product })),
  })

  // Mock onSnapshot to return an empty array of reviews
  ;(onSnapshot as Mock).mockImplementation((query, callback) => {
    callback({
      docs: [],
      //   forEach: (cb: (doc: unknown) => void) => [],
    })
    return vi.fn() // Return a mock unsubscribe function
  })

  // Mock the product store methods
  const productStore = useProductStore()
  productStore.getAverageRating = vi.fn(() => 4.0)
  productStore.getReviewCount = vi.fn(() => 5)
  productStore.fetchAllReviews = vi.fn(() => [vi.fn()]) // Mock fetchAllReviews to return mock unsubscribe functions

  const wrapper = mount(HomeView, {
    global: {
      plugins: [router, pinia],
    },
  })

  // Explicitly call fetchProducts to ensure it runs
  await productStore.fetchProducts()

  // Wait for the products to render
  await vi.waitFor(
    () => {
      // console.log('Products in store:', productStore.products.value) // Debug log
      expect(wrapper.text()).toContain('Product 1')
      expect(wrapper.text()).toContain('Product 2')
    },
    { timeout: 10000 }, // Increased timeout
  )
})

test('product listing filters products by category', async () => {
  expect(HomeView).toBeTruthy()

  // Set up Pinia
  const pinia = createPinia()
  setActivePinia(pinia)

  // Mock Firestore getDocs to return products
  const products: Product[] = [
    {
      id: '1',
      name: 'Product 1',
      price: 99,
      category: 'Electronics' as const,
      stockStatus: 'In Stock' as const,
      images: ['https://example.com/image1.jpg'],
    },
    {
      id: '2',
      name: 'Product 2',
      price: 49,
      category: 'Clothing' as const,
      stockStatus: 'Out of Stock' as const,
      images: ['https://example.com/image2.jpg'],
    },
  ]

  const { getDocs, onSnapshot } = await import('firebase/firestore')
  ;(getDocs as Mock).mockResolvedValue({
    docs: products.map((product) => ({
      id: product.id,
      data: () => product,
    })),
    forEach: (callback: (doc: { id: string; data: () => Product }) => void) =>
      products.forEach((product) => callback({ id: product.id, data: () => product })),
  })

  // Mock onSnapshot to return an empty array of reviews
  ;(onSnapshot as Mock).mockImplementation((query, callback) => {
    callback({
      docs: [],
      //   forEach: (cb: (doc: unknown) => void) => [],
    })
    return vi.fn() // Return a mock unsubscribe function
  })

  // Mock the product store methods
  const productStore = useProductStore()
  productStore.getAverageRating = vi.fn(() => 4.0)
  productStore.getReviewCount = vi.fn(() => 5)
  productStore.fetchAllReviews = vi.fn(() => [vi.fn()]) // Mock fetchAllReviews to return mock unsubscribe functions

  const wrapper = mount(HomeView, {
    global: {
      plugins: [router, pinia],
    },
  })

  // Explicitly call fetchProducts to ensure it runs
  await productStore.fetchProducts()

  // Wait for the products to render
  await vi.waitFor(
    () => {
      // console.log('Products in store:', productStore.products.value) // Debug log
      expect(wrapper.text()).toContain('Product 1')
      expect(wrapper.text()).toContain('Product 2')
    },
    { timeout: 10000 }, // Increased timeout
  )

  // Find the ProductFilter component
  const productFilter = wrapper.findComponent({ name: 'ProductFilter' })

  // Simulate setting the category filter to 'Electronics'
  await productFilter.vm.$emit('update:modelValue', {
    category: 'Electronics',
    sortBy: 'price',
    sortOrder: 'asc',
  })

  // Wait for the component to update
  await vi.waitFor(
    () => {
      expect(wrapper.text()).toContain('Product 1')
      expect(wrapper.text()).not.toContain('Product 2')
    },
    { timeout: 3000 },
  )
})

test('product listing sorts products by price', async () => {
  expect(HomeView).toBeTruthy()

  // Set up Pinia
  const pinia = createPinia()
  setActivePinia(pinia)

  // Mock Firestore getDocs to return products
  const products: Product[] = [
    {
      id: '1',
      name: 'Product 1',
      price: 99,
      category: 'Electronics' as const,
      stockStatus: 'In Stock' as const,
      images: ['https://example.com/image1.jpg'],
    },
    {
      id: '2',
      name: 'Product 2',
      price: 49,
      category: 'Clothing' as const,
      stockStatus: 'Out of Stock' as const,
      images: ['https://example.com/image2.jpg'],
    },
  ]

  const { getDocs, onSnapshot } = await import('firebase/firestore')
  ;(getDocs as Mock).mockResolvedValue({
    docs: products.map((product) => ({
      id: product.id,
      data: () => product,
    })),
    forEach: (callback: (doc: { id: string; data: () => Product }) => void) =>
      products.forEach((product) => callback({ id: product.id, data: () => product })),
  })

  // Mock onSnapshot to return an empty array of reviews
  ;(onSnapshot as Mock).mockImplementation((query, callback) => {
    callback({
      docs: [],
      //   forEach: (cb: (doc: unknown) => void) => [],
    })
    return vi.fn() // Return a mock unsubscribe function
  })

  // Mock the product store methods
  const productStore = useProductStore()
  productStore.getAverageRating = vi.fn(() => 4.0)
  productStore.getReviewCount = vi.fn(() => 5)
  productStore.fetchAllReviews = vi.fn(() => [vi.fn()]) // Mock fetchAllReviews to return mock unsubscribe functions

  const wrapper = mount(HomeView, {
    global: {
      plugins: [router, pinia],
    },
  })

  // Explicitly call fetchProducts to ensure it runs
  await productStore.fetchProducts()

  // Wait for the products to render
  await vi.waitFor(
    () => {
      // console.log('Products in store:', productStore.products.value) // Debug log
      expect(wrapper.text()).toContain('Product 1')
      expect(wrapper.text()).toContain('Product 2')
    },
    { timeout: 10000 }, // Increased timeout
  )

  // Find the ProductFilter component
  const productFilter = wrapper.findComponent({ name: 'ProductFilter' })

  // Simulate setting the sortBy to 'price' and sortOrder to 'asc'
  await productFilter.vm.$emit('update:modelValue', {
    category: '',
    sortBy: 'price',
    sortOrder: 'asc',
  })

  // Wait for the component to update
  await vi.waitFor(
    () => {
      const productCards = wrapper.findAll('.v-card')
      expect(productCards.length).toBe(2)
      expect(productCards[0].text()).toContain('Product 2') // $49
      expect(productCards[1].text()).toContain('Product 1') // $99
    },
    { timeout: 3000 },
  )
})
