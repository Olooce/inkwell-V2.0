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
  background-color: #f5f7fa;
}

.writing-tips-content {
  padding: 3rem 6rem;
  margin: 0 auto;
  width: 100%;
  max-width: 1400px;
  margin-top: 80px;
  text-align: center;
}

.loading, .error, .no-data {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  font-family: 'Fredoka', sans-serif;
}

.error {
  color: #e74c3c;
  background: #ffe5e5;
  border-radius: 8px;
}

.no-data {
  color: #555;
  font-style: italic;
}

.page-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 2rem;
  color: #333;
}

.tips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 1rem;
  margin: 0 auto;
}

.tip-card {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
}

.tip-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
}

.tip-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.8rem;
  font-weight: bold;
  color: #222;
  margin-bottom: 1rem;
}

.view-link {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background-color: #068fff;
  color: #ffffff;
  font-size: 1rem;
  font-weight: bold;
  border-radius: 8px;
  text-decoration: none;
  font-family: 'Fredoka', sans-serif;
  transition: background-color 0.3s ease;
  border: none;
  cursor: pointer;
}

.view-link:hover {
  background-color: #026fdb;
}

.view-link:focus {
  outline: 2px solid #fff;
  outline-offset: 3px;
}

@media (max-width: 1024px) {
  .writing-tips-content {
    padding: 2rem;
  }
  .tips-grid {
    gap: 1.5rem;
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
