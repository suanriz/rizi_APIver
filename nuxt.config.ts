// https://nuxt.com/docs/api/configuration/nuxt-config

const isProd = process.env.NODE_ENV === 'production'

export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    '@nuxtjs/tailwindcss',
    '@ant-design-vue/nuxt',
    '@nuxtjs/critters',
    '@nuxt/test-utils/module',
  ],
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'https://rizi-be.onrender.com',
    }
  },
  antd: {
    extractStyle: true,
    components: [],
    icons: [],
  },
  css: [
    '@/assets/variable.css',
    '@/assets/global.css'
  ],
  app: {
    baseURL: isProd ? '/rizi/' : '/',
  },
  critters: {
    config: {
      preload: 'swap'
    }
  }
})
