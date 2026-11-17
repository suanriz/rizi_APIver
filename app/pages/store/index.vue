<script lang="ts" setup>
import { useSeoMeta, definePageMeta, useRoute, useRouter } from '#imports'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { useGoodsList } from '@/composables/useGoods'
import { STORE_TAB_TYPE } from '@/utils/constants'

const route = useRoute()
const router = useRouter()
const pageConfig = ref({
  current: 1,
  pageSize: 8,
})
const activeTab = ref(Number(route.query.type) || 0)
const searchInput = ref('')
const keyword = ref('')
let searchTimer: ReturnType<typeof setTimeout> | undefined
const queryParams = computed(() => ({
  type: activeTab.value,
  page: pageConfig.value.current,
  pageSize: pageConfig.value.pageSize,
  keyword: keyword.value
}))
const { data } = useGoodsList(queryParams, { writeShared: true })
const goodList = computed(() => data.value?.list || [])
const total = computed(() => data.value?.total || 0)

const handleTabClick = (index: number) => {
  activeTab.value = index
  pageConfig.value.current = 1
}

watch(() => route.query.type, (newType) => {
  if (newType !== undefined) {
    activeTab.value = Number(newType) || 0
    pageConfig.value.current = 1
  }
})

watch(searchInput, (value) => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    keyword.value = value.trim()
    pageConfig.value.current = 1
  }, 300)
})

onBeforeUnmount(() => clearTimeout(searchTimer))

onMounted(() => {
  if (route.query && route.query.type) {
    router.replace({ query: {} })
  }
})

useSeoMeta({
  title: '線上購物',
  description: '好日子咖啡輕食線上購物，提供多款優質咖啡豆、禮盒選購。',
})
definePageMeta({ title: '線上購物' })
</script>

<template>
  <section class="contentWrap">
    <Divider title="線上購物" />
    <a-input
      v-model:value="searchInput"
      allow-clear
      aria-label="搜尋商品"
      class="mb-6"
      :maxlength="50"
      name="search"
      placeholder="輸入商品名稱搜尋"
    />
    <div class="flex flex-col md:flex-row justify-between m-auto">
      <Tab v-model="activeTab" :tab-data="STORE_TAB_TYPE" @handle-tab-click="handleTabClick" />
      <div
        class="shopWrap"
        data-aos="fade-left"
        data-aos-duration="800"
        data-aos-easing="ease-in-sine"
      >
        <div class="shopItem">
          <GoodCard v-for="good in goodList" :key="good.name" :data="good" />
        </div>
        <p v-if="goodList.length === 0" class="py-12 text-center text-[var(--deepGray)]">
          找不到符合的商品
        </p>
        <Pagination v-if="total > 0" v-model="pageConfig" :total="total" />
      </div>
    </div>
  </section>
</template>
