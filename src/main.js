import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { userStore } from './stores/userStore'
import { assessmentStore } from './stores/assessmentStore'

import Vue3Toastify from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { VAlert } from 'vuetify/components/VAlert'
import { VApp } from 'vuetify/components/VApp'
import { VBtn } from 'vuetify/components/VBtn'
import { VCard, VCardActions, VCardText, VCardTitle } from 'vuetify/components/VCard'
import { VDialog } from 'vuetify/components/VDialog'
import { VForm } from 'vuetify/components/VForm'
import { VSpacer } from 'vuetify/components/VGrid'
import { VMenu } from 'vuetify/components/VMenu'
import { VProgressCircular } from 'vuetify/components/VProgressCircular'
import { VProgressLinear } from 'vuetify/components/VProgressLinear'
import { VSkeletonLoader } from 'vuetify/components/VSkeletonLoader'
import { VTextarea } from 'vuetify/components/VTextarea'
import { VTextField } from 'vuetify/components/VTextField'

import './styles/global.css'

userStore.loadStoredUser()
assessmentStore.loadPersistedData()

const vuetify = createVuetify({
  components: {
    VAlert,
    VApp,
    VBtn,
    VCard,
    VCardActions,
    VCardText,
    VCardTitle,
    VDialog,
    VForm,
    VMenu,
    VProgressCircular,
    VProgressLinear,
    VSkeletonLoader,
    VSpacer,
    VTextarea,
    VTextField,
  },
  theme: {
    defaultTheme: 'inkwell',
    themes: {
      inkwell: {
        dark: false,
        colors: {
          primary: '#4e4feb',
          secondary: '#0a7ad6',
          error: '#c62828',
          success: '#1c7c43',
          background: '#f7f7fc',
          surface: '#ffffff',
        },
      },
    },
  },
  defaults: {
    VBtn: { variant: 'flat', rounded: 'lg' },
    VTextField: { variant: 'outlined', color: 'primary', density: 'comfortable' },
    VTextarea: { variant: 'outlined', color: 'primary' },
  },
})

createApp(App)
  .use(vuetify)
  .use(router)
  .use(Vue3Toastify, { autoClose: 4000, position: 'bottom-center', limit: 3 })
  .mount('#app')
