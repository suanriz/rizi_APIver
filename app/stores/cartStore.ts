import { message } from 'ant-design-vue'
import { defineStore } from 'pinia'

import type { GoodType, CoffeeDetailType } from '@/types'

export type CartItem = GoodType<CoffeeDetailType> & {
  count: number
  checked: boolean
}

type ApiResponse<T> = {
  status: 'success'
  data: T
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartItem[],
    loading: false,
  }),

  actions: {
    getRequestOptions (tokenOverride?: string) {
      const token = useCookie<string | null>('auth_token')
      const authToken = tokenOverride || token.value
      const config = useRuntimeConfig()
      return {
        token: authToken,
        apiBase: config.public.apiBase,
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
      }
    },

    requireLogin () {
      const { token } = this.getRequestOptions()
      if (token) return true
      useAuth().showLoginModal.value = true
      return false
    },

    async fetchCart (tokenOverride?: string) {
      if (!tokenOverride && !this.requireLogin()) {
        this.items = []
        return
      }
      const { apiBase, headers } = this.getRequestOptions(tokenOverride)
      this.loading = true
      try {
        const response = await $fetch<ApiResponse<{ items: CartItem[] }>>(`${apiBase}/api/v1/cart`, { headers })
        this.items = response.data.items
      } finally {
        this.loading = false
      }
    },

    async add (item: GoodType<CoffeeDetailType>) {
      if (!this.requireLogin()) return
      const { apiBase, headers } = this.getRequestOptions()
      await $fetch(`${apiBase}/api/v1/cart/items`, {
        method: 'POST',
        headers,
        body: { goodsId: item.id },
      })
      await this.fetchCart()
      message.success('加入成功')
    },

    async updateCount (goodsId: number, count: number) {
      if (!this.requireLogin()) return
      const { apiBase, headers } = this.getRequestOptions()
      await $fetch(`${apiBase}/api/v1/cart/items/${goodsId}`, {
        method: 'PATCH',
        headers,
        body: { count },
      })
      const item = this.items.find(x => x.id === goodsId)
      if (item) item.count = count
    },

    async remove (goodsId: number) {
      if (!this.requireLogin()) return
      const { apiBase, headers } = this.getRequestOptions()
      await $fetch(`${apiBase}/api/v1/cart/items/${goodsId}`, { method: 'DELETE', headers })
      this.items = this.items.filter(item => item.id !== goodsId)
    },

    clear () {
      this.items = []
    },

    checkAll (value: boolean) {
      this.items.forEach(item => { item.checked = value })
    },

    toggleChecked (id: number) {
      const target = this.items.find(item => item.id === id)
      if (target) target.checked = !target.checked
    },
  },
})
