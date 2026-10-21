<template>
  <div class="page page--narrow not-found">
    <div class="state-panel">
      <CircleAlert :size="40" />
      <h1>We couldn’t find that page</h1>
      <p>The link may be broken, or the page may have moved.</p>
      <v-btn color="primary" size="large" :to="home">Go to {{ signedIn ? 'your home page' : 'Inkwell' }}</v-btn>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { CircleAlert } from '@lucide/vue'
import { userStore } from '@/stores/userStore'

const signedIn = computed(() => userStore.state.isAuthenticated.value)
const home = computed(() => (signedIn.value ? '/dashboard' : '/'))
</script>

<style scoped>
.not-found {
  padding-top: 4rem;
}

.not-found h1 {
  font-size: 1.75rem;
}
</style>
