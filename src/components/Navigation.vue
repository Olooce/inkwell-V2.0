<template>
  <nav class="navbar">
    <router-link to="/dashboard" class="logo">
      <h1 class="logo-text">inkwell</h1>
    </router-link>

    <div class="user-section">
      <span v-if="isAuthenticated" class="greeting">Hi, {{ displayName }}!</span>
      <div v-if="isAuthenticated" class="menu-wrapper">
        <button class="account-btn" @click="toggleMenu">
          <v-avatar color="var(--color-dark-blue)" size="40">
            <span class="text-white">{{ userInitials }}</span>
          </v-avatar>
        </button>

        <div v-if="showMenu" class="dropdown-menu">
          <button class="menu-item" @click="handleLogout">
            Logout
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { userStore } from '@/stores/userStore'
import { authService } from '@/services/authService'

const router = useRouter()
const showMenu = ref(false)

const isAuthenticated = computed(() => userStore.state.isAuthenticated.value)

// Compute display name from user store
const displayName = computed(() => {
  const firstName = userStore.state.firstName.value
  return firstName || 'Guest'
})

// Compute initials from name
const userInitials = computed(() => {
  const firstName = userStore.state.firstName.value
  const lastName = userStore.state.lastName.value

  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  } else if (firstName) {
    return firstName[0].toUpperCase()
  }
  return 'G'
})

const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

const handleLogout = () => {
  showMenu.value = false
  authService.logout()
  router.push('/login')
}

// Close menu when clicking outside
const handleClickOutside = (event) => {
  const menuWrapper = document.querySelector('.menu-wrapper')
  if (menuWrapper && !menuWrapper.contains(event.target)) {
    showMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  userStore.loadStoredUser() // Load stored user data on mount
})
</script>


<style scoped>
.navbar {
  width: 100%;
  height: 80px;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
}

.logo {
  text-decoration: none;
}

.logo-text {
  font-family: 'Fredoka', sans-serif;
  font-weight: 500;
  font-size: 2rem;
  color: var(--color-dark-blue);
  margin: 0;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.greeting {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.25rem;
  color: #000;
}

.account-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.menu-wrapper {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 0.5rem 0;
  min-width: 150px;
  z-index: 101;
}

.menu-item {
  width: 100%;
  padding: 0.75rem 1rem;
  text-align: left;
  background: none;
  border: none;
  font-family: 'Fredoka', sans-serif;
  font-size: 1rem;
  color: #333;
  cursor: pointer;
  transition: background-color 0.2s;
}

.menu-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

@media (max-width: 600px) {
  .navbar {
    padding: 0 1rem;
  }

  .greeting {
    font-size: 1rem;
  }

  .logo-text {
    font-size: 1.5rem;
  }
}
</style>
