import { createI18n } from 'vue-i18n'
import en from './en.json'
import fr from './fr.json'
import ar from './ar.json'

const messages = { en, fr, ar }

// Define language direction metadata
const languageDirections: Record<string, 'ltr' | 'rtl'> = {
  en: 'ltr',
  fr: 'ltr',
  ar: 'rtl',
}

export const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages,
})

export const switchLanguage = (lang: 'en' | 'fr' | 'ar') => {
  i18n.global.locale.value = lang
  // Update document direction based on language
  document.documentElement.setAttribute('dir', languageDirections[lang] || 'ltr')
}
