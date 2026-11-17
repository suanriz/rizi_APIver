export default defineNuxtRouteMiddleware(() => {
  const { fetchUser, showLoginModal, loginRedirect } = useAuth()
  if (fetchUser()) return

  loginRedirect.value = '/cart'
  showLoginModal.value = true
  return navigateTo({ path: '/', query: { login: 'true', redirect: '/cart' } })
})
