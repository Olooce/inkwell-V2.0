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

      <div v-else-if="writingTips.length === 0" class="no-data">
        No completed stories with analysis available.
      </div>

      <div v-else class="tips-grid">
        <div v-for="story in writingTips"
             :key="story.story_id"
             class="tip-card">
          <div class="tip-content">
            <div class="tip-info">
              <h2 class="tip-title">{{ story.title }}</h2>
              <p class="analysis-text">{{ story.analysis }}</p>
              <ul class="tip-list">
                <li v-for="(tip, index) in story.tips" :key="index">
                  {{ tip }}
                </li>
              </ul>
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
import { toast } from 'vue3-toastify'

const userName = ref('Arabella')
const writingTips = ref([])
const loading = ref(true)
const error = ref(null)

const fetchWritingTips = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await apiClient.get('/writing-skills/analysis/')
    writingTips.value = response.data.stories || []
  } catch (err) {
    toast.error(err.message)
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

.loading, .error, .no-data {
  text-align: center;
  padding: 2rem;
  font-family: 'Fredoka', sans-serif;
}

.error {
  color: #ff4444;
}

.no-data {
  color: #666;
  font-style: italic;
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
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 1rem;
  max-width: 1400px;
  margin: 0 auto;
}

.tip-card {
  background-color: rgba(6, 143, 255, 0.18);
  border-radius: 16px;
  padding: 1.5rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: start;
  max-width: 600px;
  justify-self: stretch;
}

.tip-content {
  width: 100%;
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
  margin-bottom: 0.5rem;
}

.analysis-text {
  font-size: 1rem;
  color: #444;
  margin-bottom: 0.75rem;
}

.tip-list {
  list-style-type: disc;
  margin-left: 1.2rem;
  padding-left: 1rem;
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
