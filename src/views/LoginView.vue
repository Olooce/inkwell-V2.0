<template>
  <AuthLayout title="Welcome back!" image="/assets/images/auth/cloud-bg.jpg">
    <template #subtitle>
      New to Inkwell? <router-link to="/signup">Create an account</router-link>
    </template>

    <v-alert v-if="notice" type="info" variant="tonal" class="mb-6" density="comfortable">
      {{ notice }}
    </v-alert>
    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      class="mb-6"
      density="comfortable"
      role="alert"
    >
      {{ error }}
    </v-alert>

    <v-form ref="form" validate-on="submit lazy" @submit.prevent="handleLogin">
      <v-text-field
        v-model="email"
        label="Email"
        type="email"
        autocomplete="email"
        inputmode="email"
        :rules="emailRules"
        autofocus
        class="mb-2"
      />
      <PasswordField
        v-model="password"
        label="Password"
        autocomplete="current-password"
        :rules="[(v) => !!v || 'Enter your password']"
        class="mb-2"
      />
      <v-btn type="submit" color="primary" size="x-large" block :loading="loading">
        Log in
      </v-btn>
    </v-form>
  </AuthLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthLayout from '@/components/AuthLayout.vue'
import PasswordField from '@/components/PasswordField.vue'
import { authService } from '@/services/authService'

const route = useRoute()
const router = useRouter()

const form = ref(null)
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const notice = computed(() =>
  route.query.expired ? 'Your session has expired. Please log in again.' : '',
)

const emailRules = [
  (v) => !!v?.trim() || 'Enter your email',
  (v) => /^\S+@\S+\.\S+$/.test(v.trim()) || 'That doesn’t look like an email address',
]

// Only follow in-app redirects, never to another site.
const redirectTarget = () => {
  const target = route.query.redirect
  return typeof target === 'string' && target.startsWith('/') && !target.startsWith('//')
    ? target
    : '/dashboard'
}

const handleLogin = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return

  loading.value = true
  error.value = ''
  try {
    const { user } = await authService.login(email.value, password.value)
    await router.replace(user?.initial_assessment_completed ? redirectTarget() : '/assessment')
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>
