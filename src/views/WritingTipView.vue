<template>
  <div class="tip-view-layout">
    <Navigation :user-name="userName" />

    <main class="tip-view-content">
      <div v-if="loading" class="loading">
        Loading tip details...
      </div>

      <div v-else-if="error" class="error">
        {{ error }}
      </div>

      <template v-else>
        <div class="tip-header">
          <router-link to="/writing-tips" class="back-link">
            <span class="back-arrow">←</span> Back to Writing Tips
          </router-link>
          <h1 class="tip-title text-medium">{{ currentTip.title }}</h1>
        </div>

        <div class="tip-body">
          <!-- Analysis Section -->
          <section v-if="currentTip.analysis" class="analysis-section">
            <h2 class="section-title">Analysis</h2>
            <p class="analysis-text">{{ currentTip.analysis }}</p>
          </section>

          <!-- Writing Tips Section -->
          <section v-if="currentTip.tips && currentTip.tips.length" class="tips-section">
            <h2 class="section-title">Writing Tips</h2>
            <ul class="tip-list">
              <li v-for="(tip, index) in currentTip.tips" :key="index">
                {{ tip }}
              </li>
            </ul>
          </section>
        </div>
      </template>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Navigation from '@/components/Navigation.vue'
import { storyStore } from '@/stores/storyStore'

const userName = ref('Arabella')
const currentTip = ref(null)
const loading = ref(true)
const error = ref(null)
const router = useRouter()

onMounted(() => {
  // Retrieve the writing tip from the store.
  const tip = storyStore.getCurrentStory()
  if (tip) {
    currentTip.value = tip
  } else {
    error.value = 'No preloaded writing tip found. Please navigate from the Writing Tips list.'
    // navigate back after a delay:
    setTimeout(() => router.push({ name: 'writing-tips' }), 3000)
  }
  loading.value = false
})
</script>

<style scoped>
.tip-view-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--color-white);
}

.tip-view-content {
  flex: 1;
  padding: 2rem;
  margin: 0 auto;
  width: 100%;
  max-width: 1000px;
  margin-top: 80px;
}

.loading, .error {
  text-align: center;
  padding: 2rem;
  font-family: 'Fredoka', sans-serif;
}

.error {
  color: #ff4444;
}

.tip-header {
  margin-bottom: 3rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  color: var(--color-light-blue);
  font-family: 'Fredoka', sans-serif;
  margin-bottom: 1rem;
  text-decoration: none;
}

.back-arrow {
  margin-right: 0.5rem;
  font-size: 1.2rem;
}

.tip-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 2.5rem;
  color: var(--color-black);
}

.section-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: var(--color-black);
}

.analysis-section, .tips-section {
  margin-bottom: 3rem;
}

.analysis-text {
  font-size: 1rem;
  color: #444;
  margin-bottom: 1rem;
}

.tip-list {
  list-style-type: disc;
  margin-left: 1.2rem;
  padding-left: 1rem;
}

@media (max-width: 768px) {
  .tip-view-content {
    padding: 1rem;
  }
}
</style>
