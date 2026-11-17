import { useAuth } from '@/composables/useAuth'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:mounted', async () => {
    const { fetchUser, clearAuth } = useAuth()
    if (!fetchUser()) return

    try {
      await useCartStore().fetchCart()
    } catch (error) {
      const status = (error as { statusCode?: number, status?: number }).statusCode
        ?? (error as { status?: number }).status
      if (status === 401 || status === 403) clearAuth()
    }
  })
})
