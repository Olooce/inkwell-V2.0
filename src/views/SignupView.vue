<template>
  <AuthLayout title="Create your account">
    <template #subtitle>
      Already have an account? <router-link to="/login">Log in</router-link>
    </template>

    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      class="mb-6"
      density="comfortable"
      role="alert"
    >
      {{ error }}
      <template v-if="emailTaken">
        <router-link :to="{ name: 'login' }" class="alert-link">Go to log in</router-link>
      </template>
    </v-alert>

    <v-form ref="form" validate-on="submit lazy" @submit.prevent="handleSignup">
      <div class="name-row">
        <v-text-field
          v-model="firstName"
          label="First name"
          autocomplete="given-name"
          :rules="[required('Enter your first name')]"
          autofocus
        />
        <v-text-field
          v-model="lastName"
          label="Last name"
          autocomplete="family-name"
          :rules="[required('Enter your last name')]"
        />
      </div>
      <v-text-field
        v-model="email"
        label="Email"
        type="email"
        autocomplete="email"
        inputmode="email"
        :rules="emailRules"
        class="mb-2"
      />
      <PasswordField
        v-model="password"
        label="Password"
        autocomplete="new-password"
        hint="At least 8 characters"
        persistent-hint
        :rules="passwordRules"
        class="mb-4"
      />
      <v-btn type="submit" color="primary" size="x-large" block :loading="loading">
        Create account
      </v-btn>
    </v-form>
  </AuthLayout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthLayout from '@/components/AuthLayout.vue'
import PasswordField from '@/components/PasswordField.vue'
import { authService } from '@/services/authService'

const router = useRouter()

const form = ref(null)
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const emailTaken = ref(false)

const required = (message) => (v) => !!v?.trim() || message
const emailRules = [
  required('Enter your email'),
  (v) => /^\S+@\S+\.\S+$/.test(v.trim()) || 'That doesn’t look like an email address',
]
const passwordRules = [
  (v) => !!v || 'Choose a password',
  (v) => v.length >= 8 || 'Use at least 8 characters',
]

const handleSignup = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return

  loading.value = true
  error.value = ''
  emailTaken.value = false
  try {
    await authService.register({
      email: email.value,
      password: password.value,
      firstName: firstName.value,
      lastName: lastName.value,
    })
  } catch (err) {
    error.value = err.message
    emailTaken.value = err.message.includes('already exists')
    loading.value = false
    return
  }

  try {
    await authService.login(email.value, password.value)
    await router.replace('/assessment')
  } catch {
    await router.replace({ name: 'login' })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.name-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 1rem;
  margin-bottom: 0.5rem;
}

.alert-link {
  display: inline-block;
  margin-left: 0.25rem;
  color: inherit;
  font-weight: 700;
}

@media (max-width: 480px) {
  .name-row {
    grid-template-columns: 1fr;
  }
}
</style>
