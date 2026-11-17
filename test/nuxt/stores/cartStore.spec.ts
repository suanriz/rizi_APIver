import { useCookie } from '#imports'
import { message } from 'ant-design-vue'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAuth } from '@/composables/useAuth'
import { useCartStore } from '@/stores/cartStore'
import type { CoffeeDetailType, GoodType } from '@/types'

vi.mock('ant-design-vue', () => ({ message: { success: vi.fn() } }))

const fetchMock = vi.fn()
vi.stubGlobal('$fetch', fetchMock)
vi.stubGlobal('useRuntimeConfig', () => ({ public: { apiBase: 'https://rizi-be.onrender.com' } }))

describe('cartStore', () => {
  const mockItem: GoodType<CoffeeDetailType> = {
    id: 1,
    name: 'Coffee',
    price: 100,
    img: 'coffee.jpg',
    link: '/store/1',
    type: 1,
    tag: [1],
    detail: {
      imgs: ['coffee.jpg'],
      features: { flavor: 'Bitter', flavorDetail: 'Dark Roast', roast: 'Dark', acidity: 'Low' },
      info: ['Test info'],
    },
  }
  const cartItem = { ...mockItem, count: 1, checked: true }

  beforeEach(() => {
    setActivePinia(createPinia())
    fetchMock.mockReset()
    vi.mocked(message.success).mockClear()
    useCookie<string | null>('auth_token').value = 'customer-token'
    useAuth().showLoginModal.value = false
  })

  it('fetches the authenticated customer cart', async () => {
    fetchMock.mockResolvedValue({ status: 'success', data: { items: [cartItem] } })
    const store = useCartStore()
    await store.fetchCart()
    expect(store.items).toEqual([cartItem])
    expect(fetchMock).toHaveBeenCalledWith('https://rizi-be.onrender.com/api/v1/cart', {
      headers: { Authorization: 'Bearer customer-token' },
    })
  })

  it('can fetch the cart immediately with a newly issued login token', async () => {
    useCookie<string | null>('auth_token').value = null
    fetchMock.mockResolvedValue({ status: 'success', data: { items: [cartItem] } })
    const store = useCartStore()

    await store.fetchCart('new-login-token')

    expect(store.items).toEqual([cartItem])
    expect(fetchMock).toHaveBeenCalledWith('https://rizi-be.onrender.com/api/v1/cart', {
      headers: { Authorization: 'Bearer new-login-token' },
    })
  })

  it('adds a product then refreshes the cart so duplicate counts come from the API', async () => {
    fetchMock
      .mockResolvedValueOnce({ status: 'success' })
      .mockResolvedValueOnce({ status: 'success', data: { items: [{ ...cartItem, count: 2 }] } })
    const store = useCartStore()
    await store.add(mockItem)
    expect(fetchMock).toHaveBeenNthCalledWith(1, 'https://rizi-be.onrender.com/api/v1/cart/items', {
      method: 'POST',
      headers: { Authorization: 'Bearer customer-token' },
      body: { goodsId: 1 },
    })
    expect(store.items[0]?.count).toBe(2)
    expect(message.success).toHaveBeenCalledOnce()
  })

  it('updates a product quantity', async () => {
    fetchMock.mockResolvedValue({ status: 'success' })
    const store = useCartStore()
    store.items = [cartItem]
    await store.updateCount(1, 3)
    expect(store.items[0]?.count).toBe(3)
    expect(fetchMock).toHaveBeenCalledWith('https://rizi-be.onrender.com/api/v1/cart/items/1', {
      method: 'PATCH', headers: { Authorization: 'Bearer customer-token' }, body: { count: 3 },
    })
  })

  it('removes a product', async () => {
    fetchMock.mockResolvedValue({ status: 'success' })
    const store = useCartStore()
    store.items = [cartItem]
    await store.remove(1)
    expect(store.items).toEqual([])
    expect(fetchMock).toHaveBeenCalledWith('https://rizi-be.onrender.com/api/v1/cart/items/1', {
      method: 'DELETE', headers: { Authorization: 'Bearer customer-token' },
    })
  })

  it('opens login instead of calling the API without a token', async () => {
    useCookie<string | null>('auth_token').value = null
    fetchMock.mockClear()
    const store = useCartStore()
    await store.add(mockItem)
    expect(useAuth().showLoginModal.value).toBe(true)
  })

  it('keeps selection state locally', () => {
    const store = useCartStore()
    store.items = [cartItem, { ...cartItem, id: 2 }]
    store.checkAll(false)
    expect(store.items.every(item => !item.checked)).toBe(true)
    store.toggleChecked(1)
    expect(store.items[0]?.checked).toBe(true)
  })
})
