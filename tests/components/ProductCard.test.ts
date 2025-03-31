// tests/components/ProductCard.test.ts
import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'
import ProductCard from '../../src/components/ProductCard.vue'
import type { Product } from '../../src/types/product'

test('product card renders correctly', async () => {
  expect(ProductCard).toBeTruthy()

  const product: Product = {
    id: '1',
    name: 'Test Product',
    price: 99.99,
    category: 'Electronics',
    stockStatus: 'In Stock',
    images: ['https://example.com/image.jpg'],
  }

  const wrapper = mount(ProductCard, {
    props: {
      product,
      isAdmin: false,
      averageRating: 4.5,
      reviewCount: 10,
    },
  })

  // Check product name
  expect(wrapper.text()).toContain('Test Product')

  // Check price and category
  expect(wrapper.text()).toContain('$99.99 | Electronics')

  // Check stock status
  expect(wrapper.text()).toContain('In Stock')

  // Check review summary
  expect(wrapper.text()).toContain('4.5 (10 Reviews)')

  // Check admin actions (should not be present)
  expect(wrapper.text()).not.toContain('Edit')
  expect(wrapper.text()).not.toContain('Delete')
})

test('product card shows admin actions when isAdmin is true', async () => {
  expect(ProductCard).toBeTruthy()

  const product: Product = {
    id: '1',
    name: 'Test Product',
    price: 99.99,
    category: 'Electronics',
    stockStatus: 'In Stock',
    images: ['https://example.com/image.jpg'],
  }

  const wrapper = mount(ProductCard, {
    props: {
      product,
      isAdmin: true,
      averageRating: 4.5,
      reviewCount: 10,
    },
  })

  // Check admin actions
  expect(wrapper.text()).toContain('Edit')
  expect(wrapper.text()).toContain('Delete')
})
