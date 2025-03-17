import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { userStore } from './stores/userStore'
import Vue3Toastify from "vue3-toastify";
import "vue3-toastify/dist/index.css";

const Toast = Vue3Toastify;

// Load stored user data if available
userStore.loadStoredUser()
// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
  components,
  directives,
  defaults: {
    VBtn: {
      variant: 'flat',
    }
  }
})

const app = createApp(App)
app.use(vuetify)
app.use(router)
app.use(Toast)
app.mount('#app')



