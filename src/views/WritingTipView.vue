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
          <h1 class="tip-title">{{ currentTip.title }}</h1>
        </div>

        <div class="tip-body">
          <!-- Analysis Section -->
          <section v-if="currentTip.analysis" class="analysis-section">
            <h2 class="section-title">Analysis</h2>
            <p class="analysis-text">{{ currentTip.analysis }}</p>
          </section>

          <!-- Writing Tips Section -->
          <section v-if="currentTip.tips?.length" class="tips-section">
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
  const tip = storyStore.getCurrentStory()
  if (tip) {
    currentTip.value = tip
  } else {
    error.value = 'No preloaded writing tip found. Redirecting to Writing Tips...'
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
  background-color: #f9f9f9;
}

.tip-view-content {
  flex: 1;
  padding: 2rem;
  max-width: 900px;
  margin: 80px auto 0;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.loading, .error {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  font-weight: 500;
}

.error {
  color: #e63946;
}

.tip-header {
  margin-bottom: 2rem;
}

.back-link {
  display: flex;
  align-items: center;
  font-size: 1rem;
  font-weight: 600;
  color: #0077b6;
  text-decoration: none;
  transition: color 0.3s ease;
}

.back-link:hover {
  color: #005f87;
}

.back-arrow {
  margin-right: 0.5rem;
  font-size: 1.2rem;
}

.tip-title {
  font-size: 2rem;
  font-weight: 700;
  color: #222;
  margin-top: 0.5rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #333;
}

.analysis-section, .tips-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  border-radius: 8px;
  background: #f1f5f9;
}

.analysis-text {
  font-size: 1rem;
  line-height: 1.6;
  color: #555;
}

.tip-list {
  list-style-type: disc;
  margin-left: 1.5rem;
}

.tip-list li {
  font-size: 1rem;
  padding: 0.5rem 0;
  color: #444;
}

@media (max-width: 768px) {
  .tip-view-content {
    padding: 1.5rem;
  }
  .tip-title {
    font-size: 1.8rem;
  }
  .section-title {
    font-size: 1.3rem;
  }
}
</style>
