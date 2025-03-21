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
        No completed stories available.
      </div>

      <div v-else class="tips-grid">
        <div v-for="story in writingTips" :key="story.story_id" class="tip-card">
          <h2 class="tip-title">{{ story.title }}</h2>
          <button class="view-link" @click="viewWritingTip(story)">
            View Writing Tips
          </button>
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
import { useRouter } from 'vue-router'
import { storyStore } from '@/stores/storyStore'

const router = useRouter()
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

const viewWritingTip = (story) => {
  // Save the selected writing tip into the store.
  storyStore.setCurrentStory(story)
  // Navigate to the detail view.
  router.push({ name: 'writing-tip-view', params: { id: story.story_id } })
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
  text-align: center;
}

.tip-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.5rem;
  color: var(--color-black);
  margin-bottom: 1rem;
}

.view-link {
  display: inline-block;
  padding: 0.5rem 1rem;
  background-color: var(--color-light-blue);
  color: var(--color-white);
  border-radius: 8px;
  text-decoration: none;
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
