<template>
  <div class="page page--narrow">
    <router-link v-if="isRetake" to="/progress" class="back-link">
      <ArrowLeft :size="18" /> Back to progress
    </router-link>

    <section class="intro card">
      <div class="intro-icon" aria-hidden="true"><Sparkles :size="36" /></div>
      <h1>{{ isRetake ? 'Ready for another go?' : `Hi ${userStore.displayName.value}, welcome to Inkwell!` }}</h1>
      <p class="lead">
        <template v-if="isRetake">
          Take the quiz again to see how much your grammar has improved since you started.
        </template>
        <template v-else>
          Before you start writing, let’s see where you are. This short quiz helps us track how
          your writing grows over time.
        </template>
      </p>

      <ul class="facts">
        <li><CircleCheck :size="20" /> 5 short grammar questions on one topic</li>
        <li><CircleCheck :size="20" /> No time limit - take your time</li>
        <li><CircleCheck :size="20" /> You’ll get friendly feedback after each answer</li>
      </ul>

      <v-alert v-if="error" type="error" variant="tonal" class="mb-4 text-left" role="alert">
        {{ error }}
      </v-alert>

      <div class="actions">
        <v-btn
          v-if="hasSaved"
          color="primary"
          size="x-large"
          @click="router.push('/assessment/question')"
        >
          Continue quiz ({{ savedProgress }})
        </v-btn>
        <v-btn
          :color="hasSaved ? undefined : 'primary'"
          :variant="hasSaved ? 'outlined' : 'flat'"
          size="x-large"
          :loading="loading"
          @click="startAssessment"
        >
          {{ hasSaved ? 'Start over' : 'Start the quiz' }}
          <ArrowRight v-if="!hasSaved" :size="20" class="ml-2" />
        </v-btn>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, ArrowRight, CircleCheck, Sparkles } from '@lucide/vue'
import { userStore } from '@/stores/userStore'
import { assessmentStore } from '@/stores/assessmentStore'
import { getErrorMessage } from '@/services/apiClient'

const router = useRouter()
const loading = ref(false)
const error = ref('')

const isRetake = computed(() => userStore.state.initial_assessment_completed.value)
const hasSaved = ref(assessmentStore.hasSessionInProgress())
const savedProgress = computed(() => {
  const { current, total } = assessmentStore.getProgress()
  return `question ${current} of ${total}`
})

const startAssessment = async () => {
  loading.value = true
  error.value = ''
  try {
    await assessmentStore.startAssessment()
    router.push('/assessment/question')
  } catch (err) {
    error.value = getErrorMessage(err, 'We couldn’t load the quiz. Please try again.')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.intro {
  padding: clamp(1.75rem, 5vw, 3rem);
  text-align: center;
}

.intro-icon {
  width: 72px;
  height: 72px;
  margin: 0 auto 1.25rem;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--ink-primary-soft);
  color: var(--ink-primary);
}

.intro h1 {
  font-size: clamp(1.6rem, 4vw, 2.2rem);
  color: var(--ink-primary-strong);
}

.lead {
  margin: 1rem auto 1.5rem;
  max-width: 52ch;
  font-size: 1.1rem;
  color: var(--ink-text-muted);
}

.facts {
  list-style: none;
  padding: 0;
  margin: 0 auto 2rem;
  display: inline-flex;
  flex-direction: column;
  gap: 0.6rem;
  text-align: left;
}

.facts li {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-weight: 600;
}

.facts :deep(.lucide) {
  color: var(--ink-green);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
}
</style>
