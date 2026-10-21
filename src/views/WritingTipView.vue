<template>
  <div class="page page--narrow">
    <router-link to="/writing-tips" class="back-link">
      <ArrowLeft :size="18" /> All writing tips
    </router-link>

    <div v-if="loading" class="card panel" aria-busy="true">
      <v-skeleton-loader type="heading, paragraph, list-item, list-item, list-item" />
    </div>

    <div v-else-if="error" class="state-panel" role="alert">
      <CircleAlert :size="36" />
      <h2>We couldn’t load these tips</h2>
      <p>{{ error }}</p>
      <v-btn color="primary" @click="load">Try again</v-btn>
    </div>

    <div v-else-if="!story" class="state-panel">
      <CircleAlert :size="36" />
      <h2>We couldn’t find this story</h2>
      <p>It may not have been analysed yet. Check back in a few minutes.</p>
      <v-btn color="primary" to="/writing-tips">See all writing tips</v-btn>
    </div>

    <article v-else class="card panel">
      <header class="page-header">
        <span class="eyebrow">Feedback on</span>
        <h1>{{ story.title || 'Untitled story' }}</h1>
      </header>

      <div v-if="story.pending" class="pending">
        <p>
          The writing helper is still reading this story. Feedback usually arrives within a few
          minutes.
        </p>
        <v-btn variant="outlined" @click="load">
          <RefreshCw :size="18" class="mr-2" /> Check again
        </v-btn>
      </div>

      <section v-if="story.analysis" aria-labelledby="analysis-title" class="section">
        <h2 id="analysis-title">What the helper noticed</h2>
        <p class="analysis">{{ story.analysis }}</p>
      </section>

      <section v-if="story.tips.length" aria-labelledby="tips-title" class="section">
        <h2 id="tips-title">Tips for next time</h2>
        <ol class="tips">
          <li v-for="(tip, i) in story.tips" :key="i">{{ tip }}</li>
        </ol>
      </section>

      <div v-if="!story.pending" class="cta no-print">
        <v-btn color="primary" size="large" to="/create-story">Try these tips in a new story</v-btn>
      </div>
    </article>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, CircleAlert, RefreshCw } from '@lucide/vue'
import { getErrorMessage } from '@/services/apiClient'
import { getAnalysedStories } from '@/services/analysisService'

const route = useRoute()
const story = ref(null)
const loading = ref(true)
const error = ref('')

const load = async () => {
  loading.value = true
  error.value = ''
  try {
    const stories = await getAnalysedStories()
    story.value = stories.find((s) => String(s.story_id) === String(route.params.id)) || null
    if (story.value) document.title = `${story.value.title} · Writing tips · Inkwell`
  } catch (err) {
    error.value = getErrorMessage(err)
  } finally {
    loading.value = false
  }
}

watch(() => route.params.id, load, { immediate: true })
</script>

<style scoped>
.panel {
  padding: clamp(1.5rem, 5vw, 2.5rem);
}

.eyebrow {
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--ink-sky);
}

.section + .section {
  margin-top: 2rem;
}

.section h2 {
  font-size: 1.3rem;
  margin-bottom: 0.75rem;
}

.analysis {
  font-size: 1.1rem;
  line-height: 1.7;
  white-space: pre-line;
}

.tips {
  padding-left: 0;
  margin: 0;
  list-style: none;
  counter-reset: tip;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.tips li {
  counter-increment: tip;
  display: flex;
  gap: 0.75rem;
  padding: 0.9rem 1rem;
  border-radius: var(--ink-radius-sm);
  background: var(--ink-sky-soft);
  font-size: 1.05rem;
}

.tips li::before {
  content: counter(tip);
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--ink-sky);
  color: #fff;
  font-weight: 700;
  font-size: 0.9rem;
}

.pending {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-radius: var(--ink-radius-sm);
  background: var(--ink-sky-soft);
}

.cta {
  margin-top: 2rem;
}
</style>
