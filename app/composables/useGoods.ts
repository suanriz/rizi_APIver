import { useAsyncData, useState, toValue } from '#imports'

import { useBreadcrumb } from '@/composables/useBreadcrumb'
import type { GoodType, CoffeeDetailType, ApiListResponse } from '@/types'

type ApiResponse<T> = {
  status: 'success'
  data: T
}

const useGoodsApi = () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase.replace(/\/$/, '')

  return {
    getList: (query: { page: number, pageSize: number, type?: number, keyword?: string }) =>
      $fetch<ApiResponse<ApiListResponse<GoodType<CoffeeDetailType>>>>(
        `${apiBase}/api/v1/goods`,
        { query },
      ),
    getDetail: (id: number) =>
      $fetch<ApiResponse<GoodType<CoffeeDetailType>>>(
        `${apiBase}/api/v1/goods/${id}`,
      ),
  }
}

export const useGoodsSharedState = () => {
  const goodsList = useState<GoodType<CoffeeDetailType>[]>('shared-goods-list', () => [])
  return { goodsList }
}

export const useGoodsList = (
  params: Ref<{
    page: number
    pageSize: number
    type?: number
    keyword?: string
  }>,
  option: { writeShared: boolean } = { writeShared: false }
) => {
  const { goodsList } = useGoodsSharedState()
  const goodsApi = useGoodsApi()
  const dynamicKey = computed(() => {
    const p = toValue(params)
    return `GoodsList-${p.type}-${p.page}-${p.pageSize}-${p.keyword || ''}`
  })
  return useAsyncData(
    dynamicKey,
    async () => {
      const response = await goodsApi.getList(toValue(params))
      const res = response.data
      if (res.list && option.writeShared) goodsList.value = res.list
      return res
    },
    {
      server: true,
      default: () => ({ list: [], total: 0 }) as ApiListResponse<GoodType<CoffeeDetailType>>,
      watch: [params],
    },
  )
}

export const useGoodsDetail = (id: Ref<number>) => {
  const dynamicKey = computed(() => `GoodsDetail-${toValue(id)}`)
  const { setTitle } = useBreadcrumb()
  const goodsApi = useGoodsApi()
  const result = useAsyncData(
    dynamicKey,
    async () => {
      const response = await goodsApi.getDetail(toValue(id))
      return response.data
    },
    {
      server: true,
      default: () => ({}) as GoodType<CoffeeDetailType>,
      watch: [id],
    },
  )

  watch(
    () => result.data.value,
    (newVal) => {
      if (newVal?.name) setTitle(newVal.name)
    },
    { immediate: true }
  )

  return result
}
