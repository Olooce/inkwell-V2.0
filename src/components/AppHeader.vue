<template>
  <header class="app-header no-print">
    <div class="header-inner">
      <router-link :to="homeLink" class="brand" aria-label="Inkwell home">inkwell</router-link>

      <nav v-if="showNav" class="desktop-nav" aria-label="Main">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-link"
          active-class="is-active"
        >
          <component :is="item.icon" :size="18" />
          {{ item.label }}
        </router-link>
      </nav>

      <v-menu location="bottom end" offset="8">
        <template #activator="{ props }">
          <button v-bind="props" class="account-btn" type="button" aria-label="Account menu">
            <span class="avatar" aria-hidden="true">{{ userStore.initials.value }}</span>
            <span class="account-name">{{ userStore.displayName.value }}</span>
          </button>
        </template>
        <div class="account-menu card" role="menu">
          <div class="account-summary">
            <strong>{{ fullName }}</strong>
            <span>{{ userStore.state.email.value }}</span>
          </div>
          <button class="menu-item" role="menuitem" type="button" @click="logout">
            <LogOut :size="18" />
            Log out
          </button>
        </div>
      </v-menu>
    </div>
  </header>

  <nav v-if="showNav" class="tab-bar no-print" aria-label="Main">
    <router-link
      v-for="item in navItems"
      :key="item.to"
      :to="item.to"
      class="tab"
      active-class="is-active"
    >
      <component :is="item.icon" :size="22" />
      <span>{{ item.short }}</span>
    </router-link>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { BookOpen, ChartColumn, House, Lightbulb, LogOut, Pencil } from '@lucide/vue'
import { userStore } from '@/stores/userStore'
import { authService } from '@/services/authService'

const router = useRouter()

const navItems = [
  { to: '/dashboard', label: 'Home', short: 'Home', icon: House },
  { to: '/create-story', label: 'Write a story', short: 'Write', icon: Pencil },
  { to: '/comics', label: 'My comics', short: 'Comics', icon: BookOpen },
  { to: '/writing-tips', label: 'Writing tips', short: 'Tips', icon: Lightbulb },
  { to: '/progress', label: 'Progress', short: 'Progress', icon: ChartColumn },
]

const showNav = computed(() => userStore.state.initial_assessment_completed.value)
const homeLink = computed(() => (showNav.value ? '/dashboard' : '/assessment'))

const fullName = computed(
  () =>
    [userStore.state.firstName.value, userStore.state.lastName.value].filter(Boolean).join(' ') ||
    userStore.displayName.value,
)

const logout = () => {
  authService.logout()
  router.push('/login')
}
</script>

<style scoped>
.app-header {
  position: fixed;
  inset: 0 0 auto 0;
  z-index: 1000;
  height: var(--ink-header-height);
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--ink-border);
}

.header-inner {
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.25rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.brand {
  font-family: var(--ink-font-display);
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--ink-primary);
  text-decoration: none;
}

.desktop-nav {
  display: flex;
  gap: 0.25rem;
  margin-right: auto;
}

.nav-link {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.55rem 0.85rem;
  border-radius: 999px;
  color: var(--ink-text-muted);
  font-weight: 700;
  text-decoration: none;
  transition: background-color 0.15s, color 0.15s;
}

.nav-link:hover {
  background: var(--ink-primary-soft);
  color: var(--ink-primary-strong);
}

.nav-link.is-active {
  background: var(--ink-primary);
  color: #fff;
}

.account-btn {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.25rem 0.75rem 0.25rem 0.25rem;
  border: 1px solid var(--ink-border);
  border-radius: 999px;
  background: var(--ink-surface);
  cursor: pointer;
  font: inherit;
  font-weight: 700;
  color: var(--ink-text);
}

.desktop-nav + .account-btn {
  margin-left: 0;
}

.avatar {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--ink-primary);
  color: #fff;
  font-family: var(--ink-font-display);
  font-size: 0.95rem;
}

.account-menu {
  min-width: 220px;
  padding: 0.5rem;
}

.account-summary {
  display: flex;
  flex-direction: column;
  padding: 0.5rem 0.75rem 0.75rem;
  border-bottom: 1px solid var(--ink-border);
  margin-bottom: 0.25rem;
}

.account-summary span {
  color: var(--ink-text-muted);
  font-size: 0.9rem;
  word-break: break-all;
}

.menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 0.75rem;
  border: 0;
  border-radius: var(--ink-radius-sm);
  background: none;
  font: inherit;
  font-weight: 700;
  color: var(--ink-text);
  cursor: pointer;
  text-align: left;
}

.menu-item:hover,
.menu-item:focus-visible {
  background: var(--ink-primary-soft);
}

.tab-bar {
  display: none;
}

@media (max-width: 960px) {
  .account-name {
    display: none;
  }

  .account-btn {
    padding: 0.2rem;
  }

  .nav-link {
    padding: 0.55rem 0.65rem;
  }
}

@media (max-width: 760px) {
  .desktop-nav {
    display: none;
  }

  .account-btn,
  .desktop-nav + .account-btn {
    margin-left: auto;
  }

  .tab-bar {
    position: fixed;
    inset: auto 0 0 0;
    z-index: 1000;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    height: calc(var(--ink-tabbar-height) + env(safe-area-inset-bottom));
    padding-bottom: env(safe-area-inset-bottom);
    background: var(--ink-surface);
    border-top: 1px solid var(--ink-border);
  }

  .tab {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    color: var(--ink-text-muted);
    font-size: 0.75rem;
    font-weight: 700;
    text-decoration: none;
  }

  .tab.is-active {
    color: var(--ink-primary);
  }
}
</style>
