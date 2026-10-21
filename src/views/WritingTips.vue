<template>
  <div class="page">
    <header class="page-header">
      <h1>Writing tips</h1>
      <p>After you finish a story, the writing helper reads it and leaves you feedback here.</p>
    </header>

    <div v-if="loading" class="list" aria-busy="true" aria-label="Loading writing tips">
      <v-skeleton-loader v-for="n in 3" :key="n" type="list-item-two-line" class="card" />
    </div>

    <div v-else-if="error" class="state-panel" role="alert">
      <CircleAlert :size="36" />
      <h2>We couldn’t load your writing tips</h2>
      <p>{{ error }}</p>
      <v-btn color="primary" @click="load">Try again</v-btn>
    </div>

    <div v-else-if="!stories.length" class="state-panel">
      <img src="/assets/images/dashboard/writing-tips.png" alt="" width="120" />
      <h2>No tips yet</h2>
      <p>
        Finish a story and you’ll get feedback on it here. Feedback can take a few minutes to
        arrive after you finish.
      </p>
      <v-btn color="primary" size="large" to="/create-story">Write a story</v-btn>
    </div>

    <ul v-else class="list">
      <li v-for="story in stories" :key="story.story_id">
        <router-link
          :to="{ name: 'writing-tip-view', params: { id: story.story_id } }"
          class="card tip-row"
        >
          <span class="tip-icon" aria-hidden="true"><Lightbulb :size="24" /></span>
          <span class="tip-text">
            <strong>{{ story.title || 'Untitled story' }}</strong>
            <span v-if="story.pending">Feedback on its way</span>
            <span v-else>{{ story.tips.length }} {{ story.tips.length === 1 ? 'tip' : 'tips' }}</span>
          </span>
          <ArrowRight :size="20" class="arrow" />
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ArrowRight, CircleAlert, Lightbulb } from '@lucide/vue'
import { getErrorMessage } from '@/services/apiClient'
import { getAnalysedStories } from '@/services/analysisService'

const stories = ref([])
const loading = ref(true)
const error = ref('')

const load = async () => {
  loading.value = true
  error.value = ''
  try {
    stories.value = await getAnalysedStories()
  } catch (err) {
    error.value = getErrorMessage(err)
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.tip-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  color: inherit;
  text-decoration: none;
  transition: border-color 0.15s, transform 0.15s;
}

.tip-row:hover {
  border-color: var(--ink-primary);
  transform: translateX(2px);
}

.tip-icon {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--ink-sky-soft);
  color: var(--ink-sky);
}

.tip-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.tip-text strong {
  font-family: var(--ink-font-display);
  font-size: 1.2rem;
  font-weight: 500;
}

.tip-text span {
  color: var(--ink-text-muted);
}

.arrow {
  margin-left: auto;
  color: var(--ink-primary);
}
</style>
