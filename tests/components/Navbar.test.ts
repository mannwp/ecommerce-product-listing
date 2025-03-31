import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'
import Navbar from '../../src/components/Navbar.vue'
test('navbar', async () => {
  expect(Navbar).toBeTruthy()
  // expect(Navbar)
  const wrapper = mount(Navbar)
  expect(wrapper.text()).toContain('VueCart')
})
