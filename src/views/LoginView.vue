<template>
  <div class="login-container">
    <div class="image-section">
      <v-carousel
        v-model="carouselModel"
        hide-delimiters
        height="100%"
        class="carousel"
        :show-arrows="false"
        :cycle="true"
        :interval="2000"
        hide-controls
      >
        <v-carousel-item
          v-for="(image, i) in carouselImages"
          :key="i"
          :src="image"
          cover
          class="carousel-item"
        >
        </v-carousel-item>
      </v-carousel>
    </div>

    <div class="form-section">
      <div class="form-container">
        <h1 class="form-title">Get back to it!</h1>
        <p class="form-subtitle">
          Don't have an account? 
          <router-link to="/signup" class="signup-link">Sign Up</router-link>
        </p>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <v-form @submit.prevent="handleLogin" ref="form">
          <v-text-field
            v-model="email"
            label="Email"
            :rules="emailRules"
            variant="outlined"
            color="var(--color-light-blue)"
            bg-color="var(--color-light-blue-18)"
            class="input-field"
            required
          ></v-text-field>

          <v-text-field
            v-model="password"
            label="Password"
            :rules="passwordRules"
            variant="outlined"
            type="password"
            color="var(--color-light-blue)"
            bg-color="var(--color-light-blue-18)"
            class="input-field"
            required
          ></v-text-field>

          <v-btn
            block
            color="var(--color-light-blue)"
            size="large"
            class="submit-btn"
            type="submit"
            :loading="loading"
            :disabled="loading"
          >
            Sign In
          </v-btn>
        </v-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '@/services/authService'
import { userStore } from '@/stores/userStore'

const router = useRouter()
const form = ref(null)

// Form state
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const carouselModel = ref(0)

// Form validation rules
const emailRules = [
  v => !!v || 'Email is required',
  v => /.+@.+\..+/.test(v) || 'Email must be valid'
]

const passwordRules = [
  v => !!v || 'Password is required',
  v => v.length >= 8 || 'Password must be at least 8 characters'
]

const carouselImages = [
  '/src/assets/images/auth/cloud-bg.jpg',
  '/src/assets/images/auth/kid-pencil.jpg'
]

const handleLogin = async () => {
  try {
    // Validate form
    const { valid } = await form.value.validate()
    if (!valid) return

    loading.value = true
    error.value = ''

    // Attempt login
    const userData = await authService.login({
      email: email.value,
      password: password.value
    })


    // Redirect based on assessment status
    if (userData.user.initial_assessment_completed) {
      router.push('/dashboard')
    } else {
      router.push('/assessment')
    }
  } catch (err) {
    error.value = err.message || 'Login failed. Please try again.'
    console.error('Login error:', err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.image-section {
  padding: 2rem;
  height: 100%;
}

.carousel {
  height: 100%;
  border-radius: 24px;
  overflow: hidden;
}

.carousel-item {
  border-radius: 24px;
}

.error-message {
  color: #ff4444;
  margin-bottom: 1rem;
  text-align: center;
  font-family: 'Fredoka', sans-serif;
  padding: 1rem;
  background-color: rgba(255, 68, 68, 0.1);
  border-radius: 8px;
  font-weight: 500;
}

.form-section {
  padding: 2rem 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-container {
  width: 100%;
  max-width: 480px;
}

.form-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 3rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #000;
}

.form-subtitle {
  margin-bottom: 2rem;
  color: #666;
}

.signup-link {
  color: var(--color-light-blue);
  text-decoration: none;
  font-weight: 500;
}

.input-field {
  margin-bottom: 1rem;
}

:deep(.v-field) {
  border-radius: 8px;
}

:deep(.v-field__overlay) {
  background-color: var(--color-light-blue-18);
  opacity: 1;
}

:deep(.v-field__field) {
  color: var(--color-light-blue);
}

.submit-btn {
  margin-top: 1rem;
  height: 56px !important;
  font-family: 'Fredoka', sans-serif !important;
  font-size: 1.25rem !important;
  text-transform: none !important;
  letter-spacing: normal !important;
  border-radius: 8px !important;
}

@media (max-width: 960px) {
  .login-container {
    grid-template-columns: 1fr;
  }

  .image-section {
    display: none;
  }

  .form-section {
    padding: 2rem;
  }
}

@media (max-width: 600px) {
  .form-section {
    padding: 1rem;
  }

  .form-title {
    font-size: 2.5rem;
  }
}
</style>