<template>
  <div class="progress-container">
    <Navigation :user-name="userName" />

    <main class="main-content">
      <div class="progress-card">
        <div class="card-content">
          <h2>Initial Progress</h2>
          <div class="right-content">
            <span class="level-badge">BEGINNER</span>
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
            <span class="level-badge">10% IMPROVAL</span>
            <a href="#" class="download-link" @click.prevent="downloadProgressReport">
              Download Progress Report
            </a>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Navigation from '@/components/Navigation.vue'

const userName = ref('Arabella')

const downloadInitialReport = () => {
  console.log('Downloading initial report...')
}

const downloadProgressReport = () => {
  console.log('Downloading progress report...')
}
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
}

.download-link {
  color: #0066cc;
  text-decoration: none;
  font-weight: 500;
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
}
</style>