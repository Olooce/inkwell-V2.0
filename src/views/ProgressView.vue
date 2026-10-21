<template>
  <div class="page">
    <header class="page-header header-row">
      <div>
        <h1>My progress</h1>
        <p>How your grammar and writing have grown since your first quiz.</p>
      </div>
      <div v-if="data" class="header-actions no-print">
        <v-btn variant="outlined" @click="printReport">
          <Printer :size="18" class="mr-2" /> Print or save as PDF
        </v-btn>
        <v-btn color="primary" to="/assessment">Retake the quiz</v-btn>
      </div>
    </header>

    <div v-if="loading" class="stats" aria-busy="true" aria-label="Loading progress">
      <v-skeleton-loader v-for="n in 4" :key="n" type="article" class="card" />
    </div>

    <div v-else-if="noQuiz" class="state-panel">
      <img src="/assets/images/dashboard/progress.png" alt="" width="120" />
      <h2>Your progress will show up here</h2>
      <p>Finish the welcome quiz first so we have something to compare your progress with.</p>
      <v-btn color="primary" size="large" to="/assessment">Take the quiz</v-btn>
    </div>

    <div v-else-if="error" class="state-panel" role="alert">
      <CircleAlert :size="36" />
      <h2>We couldn’t load your progress</h2>
      <p>{{ error }}</p>
      <v-btn color="primary" @click="load">Try again</v-btn>
    </div>

    <template v-else-if="data">
      <section class="card quiz" aria-labelledby="quiz-title">
        <h2 id="quiz-title">Grammar quiz</h2>
        <div class="quiz-grid">
          <div class="quiz-stat">
            <span class="label">First quiz</span>
            <span class="value">{{ firstScore }}<small> / {{ QUIZ_LENGTH }}</small></span>
            <span class="caption">correct answers</span>
          </div>
          <div class="quiz-stat">
            <span class="label">Latest quiz</span>
            <span class="value">{{ latestScore }}<small> / {{ QUIZ_LENGTH }}</small></span>
            <span class="caption">correct answers</span>
          </div>
          <div class="quiz-stat" :class="trend.tone">
            <span class="label">Change</span>
            <span class="value">{{ trend.value }}</span>
            <span class="caption">{{ trend.caption }}</span>
          </div>
        </div>
        <p v-if="improvement === 0" class="hint no-print">
          Retake the quiz after writing a few stories to see how much you’ve improved.
        </p>
      </section>

      <h2 class="section-title">Writing</h2>
      <ul class="stats">
        <li class="card stat">
          <BookOpen :size="28" />
          <span class="value">{{ stats.total_stories ?? 0 }}</span>
          <span class="caption">{{ stats.total_stories === 1 ? 'story' : 'stories' }} started</span>
        </li>
        <li class="card stat">
          <Pencil :size="28" />
          <span class="value">{{ stats.total_sentences ?? 0 }}</span>
          <span class="caption">sentences written</span>
        </li>
        <li class="card stat">
          <CircleCheck :size="28" />
          <span class="value">{{ round(stats.accuracy) }}%</span>
          <span class="caption">of all quiz answers correct</span>
        </li>
        <li class="card stat">
          <Sparkles :size="28" />
          <span class="value">{{ round(stats.average_performance) }}<small> / 100</small></span>
          <span class="caption">average story score</span>
        </li>
      </ul>

      <p class="printed-on">Report for {{ fullName }} · {{ today }}</p>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { BookOpen, CircleAlert, CircleCheck, Pencil, Printer, Sparkles } from '@lucide/vue'
import apiClient, { getErrorMessage } from '@/services/apiClient'
import { userStore } from '@/stores/userStore'

const QUIZ_LENGTH = 5

const loading = ref(true)
const error = ref('')
const noQuiz = ref(false)
const data = ref(null)

// The backend reports raw correct-answer counts, not percentages.
const firstScore = computed(() => data.value?.initial_progress?.scores?.masked ?? 0)
const improvement = computed(() => data.value?.current_progress?.improvement ?? 0)
const latestScore = computed(() => firstScore.value + improvement.value)
const stats = computed(() => data.value?.current_progress?.stats ?? {})

const trend = computed(() => {
  const n = improvement.value
  if (n > 0) return { value: `+${n}`, caption: `more correct than your first quiz`, tone: 'up' }
  if (n < 0) return { value: `${n}`, caption: `fewer correct than your first quiz`, tone: 'down' }
  return { value: '±0', caption: 'same as your first quiz', tone: '' }
})

const round = (n) => Math.round(Number(n) || 0)
const fullName = computed(
  () =>
    [userStore.state.firstName.value, userStore.state.lastName.value].filter(Boolean).join(' ') ||
    userStore.displayName.value,
)
const today = new Date().toLocaleDateString(undefined, { dateStyle: 'long' })

const load = async () => {
  loading.value = true
  error.value = ''
  noQuiz.value = false
  try {
    const { data: overview } = await apiClient.get('/writing-skills/analysis/overview')
    data.value = overview
  } catch (err) {
    // The backend answers 500 "failed to get initial assessment" until a quiz is completed.
    const message = err.response?.data?.error || ''
    if (message.includes('assessment')) noQuiz.value = true
    else error.value = getErrorMessage(err)
  } finally {
    loading.value = false
  }
}

const printReport = () => window.print()

onMounted(load)
</script>

<style scoped>
.header-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.quiz {
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.quiz h2,
.section-title {
  font-size: 1.35rem;
  margin-bottom: 1rem;
}

.quiz-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.quiz-stat,
.stat {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.quiz-stat {
  padding: 1rem;
  border-radius: var(--ink-radius-sm);
  background: var(--ink-bg);
}

.quiz-stat.up {
  background: var(--ink-green-soft);
}

.quiz-stat.down {
  background: var(--ink-orange-soft);
}

.label {
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--ink-text-muted);
}

.value {
  font-family: var(--ink-font-display);
  font-size: 2.25rem;
  font-weight: 600;
  line-height: 1.1;
}

.value small {
  font-size: 1rem;
  color: var(--ink-text-muted);
}

.caption {
  color: var(--ink-text-muted);
}

.hint {
  margin-top: 1rem;
  color: var(--ink-text-muted);
}

.stats {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
}

.stat {
  padding: 1.25rem;
}

.stat :deep(.lucide) {
  color: var(--ink-primary);
  margin-bottom: 0.5rem;
}

.printed-on {
  display: none;
}

@media (max-width: 600px) {
  .quiz-grid {
    grid-template-columns: 1fr;
  }
}

@media print {
  .printed-on {
    display: block;
    margin-top: 2rem;
    color: var(--ink-text-muted);
  }

  .card {
    box-shadow: none;
    break-inside: avoid;
  }
}
</style>
