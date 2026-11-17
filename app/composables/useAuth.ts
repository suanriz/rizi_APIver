type AuthUser = {
  id: string
  name: string
  email: string
  accountType: 'customer'
}

type AuthResponse = {
  status: 'success'
  data: {
    user: AuthUser
    token: string
  }
}

type JwtPayload = {
  exp?: number
}

const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 28

const isTokenValid = (token: string) => {
  try {
    const encodedPayload = token.split('.')[1]
    if (!encodedPayload) return false
    const normalizedPayload = encodedPayload.replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(atob(normalizedPayload)) as JwtPayload
    return typeof payload.exp === 'number' && payload.exp * 1000 > Date.now()
  } catch {
    return false
  }
}

export const useAuth = () => {
  const cookieOptions = {
    maxAge: AUTH_COOKIE_MAX_AGE,
    path: '/',
    sameSite: 'lax' as const,
    secure: import.meta.env.PROD,
  }
  const userCookie = useCookie<AuthUser | null>('auth_user', cookieOptions)
  const tokenCookie = useCookie<string | null>('auth_token', cookieOptions)
  const user = useState<AuthUser | null>('auth_user', () => userCookie.value)
  const showLoginModal = useState<boolean>('showLoginModal', () => false)
  const loginRedirect = useState<string | null>('loginRedirect', () => null)
  const isAuthenticated = computed(() => Boolean(user.value && tokenCookie.value))
  const config = useRuntimeConfig()

  const setAuth = (response: AuthResponse) => {
    user.value = response.data.user
    userCookie.value = response.data.user
    tokenCookie.value = response.data.token
  }

  const clearAuth = () => {
    user.value = null
    userCookie.value = null
    tokenCookie.value = null
    useCartStore().clear()
  }

  const fetchUser = () => {
    const token = tokenCookie.value
    const savedUser = userCookie.value
    if (!token || !savedUser || !isTokenValid(token)) {
      clearAuth()
      return false
    }
    user.value = savedUser
    return true
  }

  const login = async (credentials: { email: string; password: string }) => {
    const response = await $fetch<AuthResponse>(`${config.public.apiBase}/api/v1/login`, {
      method: 'POST',
      body: credentials,
    })
    setAuth(response)
    await useCartStore().fetchCart(response.data.token)
    return response
  }

  const register = async (data: { email: string; password: string; name: string }) => {
    const response = await $fetch<AuthResponse>(`${config.public.apiBase}/api/v1/register`, {
      method: 'POST',
      body: data,
    })
    setAuth(response)
    await useCartStore().fetchCart(response.data.token)
    return response
  }

  const logout = async () => {
    clearAuth()
    loginRedirect.value = null
    await navigateTo('/')
  }

  return {
    user,
    isAuthenticated,
    fetchUser,
    clearAuth,
    login,
    register,
    logout,
    showLoginModal,
    loginRedirect,
  }
}
