<template>
  <v-app>
    <a href="#main-content" class="skip-link">Skip to main content</a>
    <AppHeader v-if="showShell" />
    <main id="main-content" tabindex="-1" :class="{ 'with-shell': showShell }">
      <router-view />
    </main>
  </v-app>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import { userStore } from '@/stores/userStore'

const route = useRoute()

const showShell = computed(
  () => !route.meta.public || (route.meta.allowSignedIn && userStore.state.isAuthenticated.value),
)
</script>

<style>
#main-content {
  outline: none;
  min-height: 100vh;
}

#main-content.with-shell {
  padding-top: var(--ink-header-height);
}

@media (max-width: 760px) {
  #main-content.with-shell {
    padding-bottom: calc(var(--ink-tabbar-height) + env(safe-area-inset-bottom));
  }
}
</style>
