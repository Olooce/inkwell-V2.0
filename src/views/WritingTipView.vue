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
          <h1 class="tip-title text-medium">{{ currentTip.name }}</h1>
        </div>
  
        <div class="tip-body">
          <!-- Recent Feedback Section -->
          <section v-if="currentTip.recent_feedback.length > 0" class="feedback-section">
            <h2 class="section-title">Recent Feedback</h2>
            <div class="feedback-list">
              <div v-for="(feedback, index) in currentTip.recent_feedback" 
                   :key="index" 
                   class="feedback-card">
                <p class="feedback-text">{{ feedback.text }}</p>
                <div class="feedback-meta">
                  <span class="source">{{ feedback.source }}</span>
                  <span class="date">{{ formatDate(feedback.date) }}</span>
                </div>
              </div>
            </div>
          </section>
  
          <!-- Improvements Section -->
          <section v-if="currentTip.improvements.length > 0" class="improvements-section">
            <h2 class="section-title">Your Improvements</h2>
            <div class="improvements-list">
              <div v-for="(improvement, index) in currentTip.improvements" 
                   :key="index" 
                   class="improvement-card">
                <p class="improvement-text">{{ improvement.text }}</p>
                <span class="date">{{ formatDate(improvement.date) }}</span>
              </div>
            </div>
          </section>
  
          <!-- Common Errors Section -->
          <section v-if="currentTip.common_errors.length > 0" class="errors-section">
            <h2 class="section-title">Common Errors</h2>
            <div class="errors-list">
              <div v-for="(error, index) in currentTip.common_errors" 
                   :key="index" 
                   class="error-card">
                <p class="error-text">{{ error.text }}</p>
                <span class="count">Occurred {{ error.count }} times</span>
              </div>
            </div>
          </section>
        </div>
      </template>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Navigation from '@/components/Navigation.vue'
import apiClient from '@/services/apiClient'

const userName = ref('Arabella')
const route = useRoute()
const currentTip = ref({})
const loading = ref(true)
const error = ref(null)

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const fetchTipDetails = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await apiClient.get('/writing-skills/analysis/')
    const tipId = route.params.id
    currentTip.value = response.data[tipId] || {}
    
    if (!currentTip.value.name) {
      error.value = 'Writing tip not found'
    }
  } catch (err) {
    console.error('Error fetching tip details:', err)
    error.value = 'Failed to load tip details. Please try again later.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchTipDetails()
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

.feedback-section,
.improvements-section,
.errors-section {
  margin-bottom: 3rem;
}

.feedback-card,
.improvement-card,
.error-card {
  background-color: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.feedback-text,
.improvement-text,
.error-text {
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.feedback-meta {
  display: flex;
  justify-content: space-between;
  color: #666;
  font-size: 0.9rem;
}

.source {
  text-transform: capitalize;
}

.date {
  color: #666;
  font-size: 0.9rem;
}

.count {
  color: #666;
  font-size: 0.9rem;
  font-style: italic;
}

@media (max-width: 768px) {
  .tip-view-content {
    padding: 1rem;
  }
}
</style>