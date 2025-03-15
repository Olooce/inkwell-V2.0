import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { userStore } from './stores/userStore'

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
app.mount('#app')



