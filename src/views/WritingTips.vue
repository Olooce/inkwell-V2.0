<template>
  <div class="writing-tips-layout">
    <Navigation :user-name="userName" />
    
    <main class="writing-tips-content">
      <h1 class="page-title">Writing Tips</h1>
      
      <div v-if="loading" class="loading">
        Loading writing tips...
      </div>
      
      <div v-else-if="error" class="error">
        {{ error }}
      </div>
      
      <div v-else class="tips-grid">
        <div v-for="(tip, key) in writingTips" 
             :key="key" 
             class="tip-card">
          <div class="tip-content">
            <div class="tip-info">
              <h2 class="tip-title">{{ tip.name }}</h2>
              <div class="tip-stats" v-if="tip.recent_feedback.length || tip.common_errors.length">
                <span class="stat">{{ tip.recent_feedback.length }} recent feedbacks</span>
                <span class="stat">{{ tip.common_errors.length }} common errors</span>
              </div>
            </div>
            <router-link :to="`/writing-tips/${key}`" class="view-link">
              View
            </router-link>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Navigation from '@/components/Navigation.vue'
import apiClient from '@/services/apiClient'

const userName = ref('Arabella')
const writingTips = ref({})
const loading = ref(true)
const error = ref(null)

const fetchWritingTips = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await apiClient.get('/writing-skills/analysis/')
    writingTips.value = response.data
  } catch (err) {
    console.error('Error fetching writing tips:', err)
    error.value = 'Failed to load writing tips. Please try again later.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchWritingTips()
})
</script>

<style scoped>
.writing-tips-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--color-white);
}

.writing-tips-content {
  padding: 2rem 4rem;
  margin: 0 auto;
  width: 100%;
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

.page-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 2rem;
  margin-bottom: 2rem;
  margin-left: 1rem;
  color: var(--color-black);
}

.tips-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 2rem 3rem;
  padding: 1rem;
  max-width: 1400px;
  margin: 0 auto;
}

.tip-card {
  background-color: rgba(6, 143, 255, 0.18);
  border-radius: 16px;
  padding: 1.5rem 2rem;
  display: flex;
  align-items: center;
  max-width: 600px;
  justify-self: stretch;
}

.tip-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tip-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.tip-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.5rem;
  color: var(--color-black);
  margin: 0;
}

.tip-stats {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: #666;
}

.view-link {
  color: var(--color-light-blue);
  text-decoration: underline;
  font-family: 'Fredoka', sans-serif;
}

@media (max-width: 1024px) {
  .writing-tips-content {
    padding: 2rem;
  }
  
  .tips-grid {
    gap: 2rem;
  }
}

@media (max-width: 768px) {
  .tips-grid {
    grid-template-columns: 1fr;
  }
  
  .writing-tips-content {
    padding: 1rem;
  }
}
</style>