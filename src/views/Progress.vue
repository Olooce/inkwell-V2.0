<template>
  <div class="progress-container">
    <Navigation :user-name="userName" />

    <main class="main-content">
      <div v-if="loading" class="loading">
        Loading progress data...
      </div>
      
      <div v-else-if="error" class="error">
        {{ error }}
      </div>

      <template v-else>
        <div class="progress-card">
          <div class="card-content">
            <h2>Initial Progress</h2>
            <div class="right-content">
              <span class="level-badge">{{ initialProgress.level?.toUpperCase() || 'N/A' }}</span>
              <div class="scores-container">
                <div class="score">
                  Masked Word Score: {{ initialProgress.scores?.masked?.toFixed(1) || 0 }}%
                </div>
                <div class="score">
                  Error Correction Score: {{ initialProgress.scores?.error_correction?.toFixed(1) || 0 }}%
                </div>
              </div>
              <a href="#" class="download-link" @click.prevent="downloadInitialReport">
                Download Initial Report
              </a>
            </div>
          </div>
        </div>

        <div class="progress-card">
          <div class="card-content">
            <h2>Current Progress</h2>
            <div class="right-content">
              <span class="level-badge">{{ currentProgress.improvement?.toFixed(1) || 0 }}% IMPROVEMENT</span>
              <div class="stats-container">
                <div class="stat">Stories: {{ currentProgress.stats?.total_stories || 0 }}</div>
                <div class="stat">Sentences: {{ currentProgress.stats?.total_sentences || 0 }}</div>
                <div class="stat">Accuracy: {{ currentProgress.stats?.accuracy?.toFixed(1) || 0 }}%</div>
              </div>
              <a href="#" class="download-link" @click.prevent="downloadProgressReport">
                Download Progress Report
              </a>
            </div>
          </div>
        </div>
      </template>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Navigation from '@/components/Navigation.vue'
import apiClient from '@/services/apiClient'

const userName = ref('Arabella')
const loading = ref(true)
const error = ref(null)
const initialProgress = ref({})
const currentProgress = ref({})

// Fetch progress data
const fetchProgress = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await apiClient.get('/progress/overview/')
    initialProgress.value = response.data.initial_progress
    currentProgress.value = response.data.current_progress
  } catch (err) {
    console.error('Error fetching progress:', err)
    error.value = 'Failed to load progress data. Please try again later.'
  } finally {
    loading.value = false
  }
}

// Download reports
const downloadInitialReport = async () => {
  try {
    const response = await apiClient.get('/progress/download_report/?type=initial', {
      responseType: 'blob'
    })
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'initial_progress_report.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Error downloading initial report:', err)
    alert('Failed to download report. Please try again later.')
  }
}

const downloadProgressReport = async () => {
  try {
    const response = await apiClient.get('/progress/download_report/?type=current', {
      responseType: 'blob'
    })
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'progress_report.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Error downloading progress report:', err)
    alert('Failed to download report. Please try again later.')
  }
}

// Fetch data on component mount
onMounted(() => {
  fetchProgress()
})
</script>

<style scoped>
.progress-container {
  width: 100%;
  background-color: #fff;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 7rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.loading, .error {
  text-align: center;
  padding: 2rem;
  font-family: 'Fredoka', sans-serif;
}

.error {
  color: #ff4444;
}

.progress-card {
  background-color: #e8ffd4;
  border-radius: 1rem;
  padding: 2rem;
  width: 100%;
}

.card-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

h2 {
  font-size: 1.5rem;
  margin: 0;
  color: #333;
  font-weight: 500;
}

.right-content {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.level-badge {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  background-color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
}

.scores-container, .stats-container {
  text-align: right;
  font-size: 0.9rem;
  color: #666;
}

.score, .stat {
  margin-bottom: 0.25rem;
}

.download-link {
  color: #0066cc;
  text-decoration: none;
  font-weight: 500;
  margin-top: 0.5rem;
}

.download-link:hover {
  text-decoration: underline;
}

/* Responsive Design */
@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }

  .card-content {
    flex-direction: column;
    gap: 1rem;
  }

  .right-content {
    align-items: flex-start;
    width: 100%;
  }

  .scores-container, .stats-container {
    text-align: left;
  }

  .level-badge {
    align-self: flex-start;
  }
}
</style>