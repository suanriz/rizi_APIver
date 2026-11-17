<script lang="ts" setup>
import { navigateTo } from '#imports'
import { reactive, ref, watch } from 'vue'

import { GoogleOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { FormInstance, FormProps } from 'ant-design-vue'

import { useAuth } from '@/composables/useAuth'

type AuthMode = 'login' | 'register'

type AuthForm = {
  email: string
  password: string
  passwordConfirm: string
  name: string
}

type ApiError = {
  data?: {
    message?: string
  }
}

const isOpen = defineModel<boolean>({ required: true })
const formRef = ref<FormInstance>()
const activeTab = ref<AuthMode>('login')
const loading = ref(false)
const segmentedOptions = [
  { label: '登入', value: 'login' },
  { label: '註冊', value: 'register' },
]
const formData = reactive<AuthForm>({
  email: '',
  password: '',
  passwordConfirm: '',
  name: '',
})

const { login, register, loginRedirect } = useAuth()

const getErrorMessage = (error: unknown) => {
  const apiMessage = (error as ApiError)?.data?.message
  if (apiMessage === 'Invalid email or password') return '電子信箱或密碼錯誤'
  if (apiMessage === 'Email is already registered') return '此電子信箱已經註冊'
  if (apiMessage === 'Invalid registration data') return '註冊資料格式不正確'
  if (apiMessage === 'Invalid login data') return '登入資料格式不正確'
  return apiMessage || '目前無法完成操作，請稍後再試'
}

const handleSubmit: FormProps['onFinish'] = async () => {
  try {
    loading.value = true
    if (activeTab.value === 'login') {
      await login({ email: formData.email, password: formData.password })
      message.success('登入成功')
    } else {
      await register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
      })
      message.success('註冊成功')
    }
    isOpen.value = false
    const redirectTo = loginRedirect.value || '/user'
    loginRedirect.value = null
    await navigateTo(redirectTo)
  } catch (error) {
    message.error(getErrorMessage(error))
  } finally {
    loading.value = false
  }
}

watch(activeTab, () => {
  formData.password = ''
  formData.passwordConfirm = ''
  formData.name = ''
  formRef.value?.clearValidate()
})
</script>

<template>
  <a-modal
    v-model:open="isOpen"
    :closable="false"
    :width="400"
    destroy-on-close
  >
    <a-segmented v-model:value="activeTab" block :options="segmentedOptions" />
    <a-form
      ref="formRef"
      :model="formData"
      hide-required-mark
      label-align="left"
      :label-col="{ style: { width: '80px' } }"
      class="w-full flex flex-col items-center !mt-[20px]"
      @finish="handleSubmit"
    >
      <a-form-item
        label="電子信箱"
        name="email"
        :rules="[
          { required: true, message: '請輸入電子信箱' },
          { type: 'email', message: '電子信箱格式不正確' },
          { max: 50, message: '電子信箱不可超過 50 個字元' }
        ]"
      >
        <a-input v-model:value="formData.email" autocomplete="email" />
      </a-form-item>
      <a-form-item
        label="密碼"
        name="password"
        :rules="[
          { required: true, message: '請輸入密碼' },
          ...(activeTab === 'register'
            ? [{ min: 8, message: '密碼至少需要 8 個字元' }]
            : []),
          { max: 72, message: '密碼不可超過 72 個字元' }
        ]"
      >
        <a-input-password v-model:value="formData.password" autocomplete="current-password" />
      </a-form-item>
      <a-form-item
        v-if="activeTab === 'register'"
        label="確認密碼"
        name="passwordConfirm"
        :rules="[
          { required: true, message: '請再次輸入密碼' },
          {
            validator: async (_rule: unknown, value: string) => {
              if (value && formData.password !== value) {
                throw new Error('兩次輸入的密碼不一致')
              }
            }
          }
        ]"
      >
        <a-input-password v-model:value="formData.passwordConfirm" autocomplete="new-password" />
      </a-form-item>
      <a-form-item
        v-if="activeTab === 'register'"
        label="姓名"
        name="name"
        :rules="[
          { required: true, whitespace: true, message: '請輸入姓名' },
          { max: 20, message: '姓名不可超過 20 個字元' }
        ]"
      >
        <a-input v-model:value="formData.name" autocomplete="name" />
      </a-form-item>
      <a-button
        type="primary"
        html-type="submit"
        class="w-full mt-[20px]"
        :loading="loading"
      >
        {{ activeTab === 'login' ? '登入' : '註冊' }}
      </a-button>
    </a-form>
    <a-divider>or</a-divider>
    <a-button class="w-full !flex items-center justify-center" disabled>
      <GoogleOutlined class="text-[18px]" /> 使用 Google 登入
    </a-button>
    <template #footer />
  </a-modal>
</template>

<style scoped>
.ant-modal .ant-modal-footer {
  display: none !important;
}
</style>
