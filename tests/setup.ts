// tests/setup.ts
import { config } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import { createI18n } from 'vue-i18n'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import en from '../src/i18n/en.json'
import { vi } from 'vitest'

// Create Vuetify instance
const vuetify = createVuetify({
  components,
  directives,
})

// Create i18n instance
const i18n = createI18n({
  locale: 'en',
  messages: { en },
})

// Mock global plugins
config.global.plugins = [vuetify, i18n]

// Mock window.location for router navigation
Object.defineProperty(window, 'location', {
  value: { href: '' },
  writable: true,
})

// Mock ResizeObserver
const ResizeObserverMock = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))
vi.stubGlobal('ResizeObserver', ResizeObserverMock)
