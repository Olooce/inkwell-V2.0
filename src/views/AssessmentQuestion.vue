<template>
  <div class="page page--narrow">
    <!-- Finished -->
    <section v-if="finished" class="card panel summary" aria-labelledby="summary-title">
      <div class="summary-icon" aria-hidden="true"><Sparkles :size="36" /></div>
      <h1 id="summary-title" ref="summaryHeading" tabindex="-1">Quiz complete - great work!</h1>
      <p class="summary-score">
        You got <strong>{{ correctCount }} of {{ results.length }}</strong> right.
      </p>
      <p class="muted">
        Now for the fun part: write a story and watch it turn into a comic.
      </p>
      <div class="summary-actions">
        <v-btn color="primary" size="x-large" to="/create-story">Write my first story</v-btn>
        <v-btn variant="outlined" size="x-large" to="/dashboard">Go to my home page</v-btn>
      </div>
    </section>

    <!-- Question -->
    <section v-else-if="question" class="card panel" aria-labelledby="question-title">
      <div class="progress-row">
        <span class="step">Question {{ progress.current }} of {{ progress.total }}</span>
        <span v-if="assessmentStore.state.topic.value" class="topic">
          {{ assessmentStore.state.topic.value }}
        </span>
      </div>
      <v-progress-linear
        :model-value="(answeredCount / progress.total) * 100"
        color="primary"
        bg-color="primary"
        height="8"
        rounded
        class="mb-8"
        :aria-label="`${answeredCount} of ${progress.total} questions answered`"
      />

      <h1 id="question-title" ref="questionHeading" class="instruction" tabindex="-1">
        {{ isMasked ? 'Fill in the missing word' : 'Fix the mistake in this sentence' }}
      </h1>

      <p class="sentence" :class="{ 'sentence--error': !isMasked }">
        <template v-if="isMasked">
          <span v-for="(part, i) in maskedParts" :key="i">
            {{ part }}<span v-if="i < maskedParts.length - 1" class="blank">{{ answer || '' }}</span>
          </span>
        </template>
        <template v-else>{{ question.error_sentence }}</template>
      </p>

      <form v-if="!result" class="answer-form" @submit.prevent="submit">
        <v-text-field
          ref="answerInput"
          v-model="answer"
          :label="isMasked ? 'Missing word' : 'Corrected sentence'"
          :placeholder="isMasked ? 'Type one word' : 'Type the whole sentence, corrected'"
          :disabled="checking"
          autocomplete="off"
          autocapitalize="off"
          spellcheck="false"
          hide-details
          autofocus
        />
        <v-btn
          type="submit"
          color="primary"
          size="x-large"
          :loading="checking"
          :disabled="!answer.trim()"
        >
          Check answer
        </v-btn>
        <p v-if="checking" class="muted checking" role="status">Checking your answer…</p>
      </form>

      <div
        v-else
        class="feedback"
        :class="result.isCorrect ? 'feedback--correct' : 'feedback--wrong'"
        role="status"
      >
        <h2>
          <component :is="result.isCorrect ? CircleCheck : CircleAlert" :size="24" />
          {{ result.isCorrect ? 'Correct!' : 'Not quite' }}
        </h2>
        <p v-if="result.feedback" class="feedback-text">{{ result.feedback }}</p>
        <p class="your-answer">Your answer: “{{ result.answer }}”</p>
        <v-btn ref="nextButton" color="primary" size="x-large" class="mt-4" @click="next">
          {{ isLast ? 'See my results' : 'Next question' }}
          <ArrowRight :size="20" class="ml-2" />
        </v-btn>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'
import { ArrowRight, CircleAlert, CircleCheck, Sparkles } from '@lucide/vue'
import { assessmentStore } from '@/stores/assessmentStore'
import { userStore } from '@/stores/userStore'
import { getErrorMessage } from '@/services/apiClient'

const router = useRouter()

const answer = ref('')
const checking = ref(false)
const finished = ref(false)
const results = ref([])
const questionHeading = ref(null)
const summaryHeading = ref(null)
const nextButton = ref(null)

const question = computed(() => assessmentStore.getCurrentQuestion())
const progress = computed(() => assessmentStore.getProgress())
const isLast = computed(() => progress.value.current === progress.value.total)
const isMasked = computed(() => question.value?.question_type === 'masked')
const maskedParts = computed(() => (question.value?.masked_sentence || '').split('[MASK]'))
const answeredCount = computed(() => assessmentStore.state.answers.value.length)
const correctCount = computed(() => results.value.filter((r) => r.isCorrect).length)


const result = computed(() =>
  assessmentStore.state.answers.value.find((a) => a.questionId === question.value?.id),
)

onMounted(() => {
  if (!question.value) router.replace('/assessment')
})

const submit = async () => {
  if (!answer.value.trim() || checking.value) return
  checking.value = true
  try {
    await assessmentStore.submitAnswer(answer.value.trim())
    await nextTick()
    nextButton.value?.$el?.focus()
  } catch (err) {
    toast.error(getErrorMessage(err, 'We couldn’t check that answer. Please try again.'))
  } finally {
    checking.value = false
  }
}

const next = async () => {
  answer.value = ''
  if (assessmentStore.nextQuestion()) {
    await nextTick()
    questionHeading.value?.focus()
    return
  }

  // Last question answered: the backend has now marked the quiz as completed.
  results.value = assessmentStore.state.answers.value
  userStore.markAssessmentCompleted()
  assessmentStore.resetAssessment()
  finished.value = true
  await nextTick()
  summaryHeading.value?.focus()
}
</script>

<style scoped>
.panel {
  padding: clamp(1.5rem, 5vw, 2.75rem);
}

.progress-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.6rem;
  font-weight: 700;
}

.step {
  color: var(--ink-primary-strong);
}

.topic {
  padding: 0.2rem 0.75rem;
  border-radius: 999px;
  background: var(--ink-sky-soft);
  color: var(--ink-sky);
  font-size: 0.9rem;
}

.instruction {
  font-size: clamp(1.4rem, 3.5vw, 1.8rem);
  margin-bottom: 1.25rem;
  outline: none;
}

.sentence {
  padding: 1.25rem 1.5rem;
  margin-bottom: 1.5rem;
  border-radius: var(--ink-radius);
  background: var(--ink-primary-soft);
  font-size: clamp(1.2rem, 3vw, 1.45rem);
  line-height: 1.7;
}

.sentence--error {
  background: var(--ink-orange-soft);
}

.blank {
  display: inline-block;
  min-width: 5ch;
  margin: 0 0.25rem;
  padding: 0 0.4rem;
  border-bottom: 3px solid var(--ink-primary);
  color: var(--ink-primary-strong);
  font-weight: 700;
  text-align: center;
}

.answer-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.checking {
  text-align: center;
}

.muted {
  color: var(--ink-text-muted);
}

.feedback {
  padding: 1.25rem 1.5rem;
  border-radius: var(--ink-radius);
  border: 2px solid;
}

.feedback h2 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.feedback--correct {
  background: var(--ink-green-soft);
  border-color: var(--ink-green);
}

.feedback--correct h2 {
  color: var(--ink-green);
}

.feedback--wrong {
  background: var(--ink-orange-soft);
  border-color: #c76a00;
}

.feedback--wrong h2 {
  color: #8a4a00;
}

.feedback-text {
  font-size: 1.05rem;
}

.your-answer {
  margin-top: 0.5rem;
  color: var(--ink-text-muted);
}

.summary {
  text-align: center;
}

.summary h1 {
  font-size: clamp(1.6rem, 4vw, 2.2rem);
  color: var(--ink-primary-strong);
  outline: none;
}

.summary-icon {
  width: 72px;
  height: 72px;
  margin: 0 auto 1.25rem;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--ink-primary-soft);
  color: var(--ink-primary);
}

.summary-score {
  margin: 1rem 0 0.5rem;
  font-size: 1.3rem;
}

.summary-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 2rem;
}
</style>
