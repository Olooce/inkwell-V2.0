<template>
  <div class="page page--narrow">
    <!-- Checking for an unfinished story -->
    <div v-if="stage === 'loading'" class="state-panel" role="status">
      <v-progress-circular indeterminate color="primary" />
      <p>Getting your story ready…</p>
    </div>

    <div v-else-if="stage === 'error'" class="state-panel" role="alert">
      <CircleAlert :size="36" />
      <h2>We couldn’t load your story</h2>
      <p>{{ loadError }}</p>
      <v-btn color="primary" @click="load">Try again</v-btn>
    </div>

    <!-- Step 1: title -->
    <template v-else-if="stage === 'title'">
      <header class="page-header">
        <h1>Start a new story</h1>
        <p>Give your story a title. Then you’ll write it one sentence at a time - {{ MAX_SENTENCES }} sentences in all.</p>
      </header>

      <form class="card panel" @submit.prevent="startStory">
        <v-text-field
          v-model="title"
          label="Story title"
          placeholder="e.g. The Dragon Who Was Afraid of the Dark"
          counter="80"
          maxlength="80"
          autofocus
          :disabled="starting"
        />
        <v-btn
          type="submit"
          color="primary"
          size="x-large"
          block
          :loading="starting"
          :disabled="!title.trim()"
        >
          Start writing
          <ArrowRight :size="20" class="ml-2" />
        </v-btn>
      </form>

      <section class="card panel idea" aria-labelledby="idea-title">
        <h2 id="idea-title"><Lightbulb :size="20" /> Need an idea?</h2>
        <p class="muted">Pick a kind of story and the writing helper will suggest one.</p>
        <div class="genres" role="group" aria-label="Kind of story">
          <button
            v-for="g in genres"
            :key="g.genre"
            type="button"
            class="genre"
            :disabled="ideaLoading"
            @click="getIdea(g)"
          >
            {{ g.label }}
          </button>
        </div>
        <p v-if="ideaLoading" class="muted" role="status">Thinking of an idea…</p>
        <p v-else-if="idea" class="idea-text" aria-live="polite">{{ idea }}</p>
      </section>
    </template>

    <!-- Step 2: writing -->
    <template v-else-if="stage === 'writing'">
      <header class="page-header">
        <span class="eyebrow">Your story</span>
        <h1>{{ story.title }}</h1>
      </header>

      <ol class="stepper" :aria-label="`${sentenceCount} of ${story.maxSentences} sentences written`">
        <li
          v-for="n in story.maxSentences"
          :key="n"
          :class="{ done: n <= sentenceCount, current: n === sentenceCount + 1 }"
          aria-hidden="true"
        >
          {{ n }}
        </li>
      </ol>

      <p v-if="missingSentences" class="note">
        <CircleAlert :size="18" />
        You wrote {{ missingSentences }}
        {{ missingSentences === 1 ? 'sentence' : 'sentences' }} of this story on another device, so
        {{ missingSentences === 1 ? 'it isn’t' : 'they aren’t' }} shown here.
      </p>

      <ol v-if="sentences.length" class="sentences">
        <li v-for="(s, i) in sentences" :key="s.id ?? i" class="card sentence-card">
          <div class="sentence-media">
            <img
              v-if="s.image_url && !brokenImages[s.id]"
              :src="assetUrl(s.image_url)"
              :alt="`Picture for: ${s.corrected_text || s.original_text}`"
              loading="lazy"
              @error="brokenImages[s.id] = true"
            />
            <div v-else class="no-image">
              <ImageIcon :size="28" />
              <span>No picture this time</span>
            </div>
          </div>
          <div class="sentence-body">
            <span class="sentence-num">Sentence {{ i + 1 + missingSentences }}</span>
            <p class="final-text">{{ s.corrected_text || s.original_text }}</p>
            <p v-if="wasCorrected(s)" class="original">
              <span class="label">You wrote:</span> {{ s.original_text }}
            </p>
            <p v-if="s.feedback" class="feedback">
              <Sparkles :size="16" /> {{ s.feedback }}
            </p>
          </div>
        </li>
      </ol>

      <div v-if="submitting" class="card panel working" role="status">
        <v-progress-linear indeterminate color="primary" rounded height="6" />
        <p>
          <strong>Checking your grammar and drawing your picture…</strong><br />
          This can take up to a minute. You can stay on this page.
        </p>
      </div>

      <form v-else-if="!isFull" class="card panel" @submit.prevent="addSentence">
        <label for="sentence" class="prompt">{{ prompt }}</label>
        <v-textarea
          id="sentence"
          ref="sentenceInput"
          v-model="sentence"
          :placeholder="sentenceCount === 0 ? 'Once upon a time…' : 'Then…'"
          rows="3"
          auto-grow
          counter="300"
          maxlength="300"
          hint="Press Enter to submit · Shift + Enter for a new line"
          persistent-hint
          @keydown.enter.exact.prevent="addSentence"
        />
        <div class="form-actions">
          <v-btn
            v-if="sentenceCount > 0"
            variant="text"
            :disabled="completing"
            @click="confirmFinish = true"
          >
            Finish story early
          </v-btn>
          <v-btn type="submit" color="primary" size="large" :disabled="!sentence.trim()">
            Add sentence {{ sentenceCount + 1 }}
          </v-btn>
        </div>
      </form>

      <div v-else class="card panel finish">
        <h2>That’s all {{ story.maxSentences }} sentences!</h2>
        <p class="muted">Finish your story to turn it into a comic.</p>
        <v-btn color="primary" size="x-large" :loading="completing" @click="completeStory">
          Finish my story
        </v-btn>
      </div>
    </template>

    <!-- Step 3: done -->
    <section v-else-if="stage === 'done'" class="card panel done" aria-labelledby="done-title">
      <div class="done-icon" aria-hidden="true"><Sparkles :size="40" /></div>
      <h1 id="done-title" ref="doneHeading" tabindex="-1">You did it - great job!</h1>
      <p>
        “{{ story.title }}” is finished. We’re turning it into a comic now; it will appear in
        <strong>My comics</strong> in a minute or two.
      </p>
      <div class="done-actions">
        <v-btn color="primary" size="x-large" to="/comics">Go to my comics</v-btn>
        <v-btn variant="outlined" size="x-large" @click="reset">Write another story</v-btn>
      </div>
    </section>

    <v-dialog v-model="confirmFinish" max-width="420">
      <v-card class="pa-2">
        <v-card-title>Finish your story now?</v-card-title>
        <v-card-text>
          You’ve written {{ sentenceCount }} of {{ story?.maxSentences }} sentences. You won’t be
          able to add more once it’s finished.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="confirmFinish = false">Keep writing</v-btn>
          <v-btn color="primary" :loading="completing" @click="completeStory">Finish story</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick, onMounted } from 'vue'
import { toast } from 'vue3-toastify'
import { ArrowRight, CircleAlert, Image as ImageIcon, Lightbulb, Sparkles } from '@lucide/vue'
import apiClient, { assetUrl, getErrorMessage } from '@/services/apiClient'
import { storyStore, MAX_SENTENCES } from '@/stores/storyStore'

const stage = ref('loading') // loading | error | title | writing | done
const loadError = ref('')
const story = ref(null)
const sentences = ref([])
const brokenImages = reactive({})

const title = ref('')
const starting = ref(false)
const sentence = ref('')
const submitting = ref(false)
const completing = ref(false)
const confirmFinish = ref(false)
const sentenceInput = ref(null)
const doneHeading = ref(null)

const sentenceCount = computed(() => story.value?.sentenceCount ?? 0)
const isFull = computed(() => sentenceCount.value >= (story.value?.maxSentences ?? MAX_SENTENCES))
// Sentences the backend has counted but this device has no copy of.
const missingSentences = computed(() => Math.max(0, sentenceCount.value - sentences.value.length))

const prompt = computed(() => {
  if (sentenceCount.value === 0) return 'Write the first sentence of your story'
  if (sentenceCount.value === story.value.maxSentences - 1) return 'How does your story end?'
  return 'What happens next?'
})

const wasCorrected = (s) =>
  s.corrected_text && s.corrected_text.trim() !== s.original_text.trim()

const enterWriting = (activeStory) => {
  story.value = activeStory
  sentences.value = storyStore.getSavedSentences(activeStory.id)
  stage.value = 'writing'
}

const load = async () => {
  stage.value = 'loading'
  try {
    const active = await storyStore.getActiveStory()
    if (active) enterWriting(active)
    else stage.value = 'title'
  } catch (err) {
    loadError.value = getErrorMessage(err)
    stage.value = 'error'
  }
}

onMounted(load)

const startStory = async () => {
  if (!title.value.trim()) return
  starting.value = true
  try {
    const started = await storyStore.startStory(title.value.trim())
    if (started.resumed) toast.info('You already had a story in progress, so we opened it for you.')
    enterWriting(started)
    await nextTick()
    sentenceInput.value?.focus()
  } catch (err) {
    toast.error(getErrorMessage(err, 'We couldn’t start your story. Please try again.'))
  } finally {
    starting.value = false
  }
}

const addSentence = async () => {
  const text = sentence.value.trim()
  if (!text || submitting.value || isFull.value) return
  submitting.value = true
  try {
    const saved = await storyStore.addSentence(story.value.id, text)
    sentences.value.push(saved)
    story.value.sentenceCount++
    sentence.value = ''
  } catch (err) {
    // Keep what they typed so nothing is lost.
    toast.error(getErrorMessage(err, 'We couldn’t add that sentence. Please try again.'))
  } finally {
    submitting.value = false
    await nextTick()
    sentenceInput.value?.focus()
  }
}

const completeStory = async () => {
  completing.value = true
  try {
    await storyStore.completeStory(story.value.id)
    confirmFinish.value = false
    stage.value = 'done'
    await nextTick()
    doneHeading.value?.focus()
  } catch (err) {
    toast.error(getErrorMessage(err, 'We couldn’t finish your story. Please try again.'))
  } finally {
    completing.value = false
  }
}

const reset = () => {
  story.value = null
  sentences.value = []
  title.value = ''
  stage.value = 'title'
}

// ---- Story ideas ----------------------------------------------------------

const genres = [
  { label: 'Adventure', genre: 'adventure', theme: 'exploring somewhere new' },
  { label: 'Fantasy', genre: 'fantasy', theme: 'magic and friendship' },
  { label: 'Mystery', genre: 'mystery', theme: 'a puzzling disappearance' },
  { label: 'Animals', genre: 'animal story', theme: 'courage' },
  { label: 'Space', genre: 'science fiction', theme: 'a journey to another planet' },
]
const idea = ref('')
const ideaLoading = ref(false)

const getIdea = async ({ genre, theme }) => {
  ideaLoading.value = true
  try {
    const { data } = await apiClient.get('/chat/story-idea', { params: { genre, theme } })
    idea.value = data.idea
  } catch (err) {
    toast.error(getErrorMessage(err, 'We couldn’t get an idea right now. Please try again.'))
  } finally {
    ideaLoading.value = false
  }
}
</script>

<style scoped>
.panel {
  padding: 1.5rem;
  margin-bottom: 1.25rem;
}

.muted {
  color: var(--ink-text-muted);
}

.eyebrow {
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--ink-pink);
}

.idea h2 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  margin-bottom: 0.25rem;
}

.genres {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1rem 0;
}

.genre {
  padding: 0.5rem 1rem;
  border: 1px solid var(--ink-border);
  border-radius: 999px;
  background: var(--ink-surface);
  font: inherit;
  font-weight: 700;
  color: var(--ink-primary-strong);
  cursor: pointer;
}

.genre:hover:not(:disabled) {
  border-color: var(--ink-primary);
  background: var(--ink-primary-soft);
}

.genre:disabled {
  opacity: 0.5;
  cursor: wait;
}

.idea-text {
  padding: 1rem;
  border-radius: var(--ink-radius-sm);
  background: var(--ink-sky-soft);
  white-space: pre-line;
}

.stepper {
  list-style: none;
  padding: 0;
  margin: 0 0 1.5rem;
  display: flex;
  gap: 0.5rem;
}

.stepper li {
  flex: 1;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: var(--ink-border);
  color: var(--ink-text-muted);
  font-weight: 700;
}

.stepper li.done {
  background: var(--ink-primary);
  color: #fff;
}

.stepper li.current {
  background: var(--ink-primary-soft);
  color: var(--ink-primary-strong);
  outline: 2px solid var(--ink-primary);
  outline-offset: -2px;
}

.note {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  padding: 0.75rem 1rem;
  border-radius: var(--ink-radius-sm);
  background: var(--ink-orange-soft);
}

.sentences {
  list-style: none;
  padding: 0;
  margin: 0 0 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sentence-card {
  display: grid;
  grid-template-columns: 180px 1fr;
  overflow: hidden;
}

.sentence-media img,
.no-image {
  width: 100%;
  height: 100%;
  min-height: 150px;
  object-fit: cover;
  display: block;
}

.no-image {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  background: var(--ink-bg);
  color: var(--ink-text-muted);
  font-size: 0.85rem;
}

.sentence-body {
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.sentence-num {
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--ink-primary);
}

.final-text {
  font-size: 1.15rem;
  font-weight: 600;
}

.original {
  color: var(--ink-text-muted);
  text-decoration: line-through;
  text-decoration-color: rgba(198, 40, 40, 0.5);
}

.original .label {
  text-decoration: none;
  display: inline-block;
  font-weight: 700;
}

.feedback {
  display: flex;
  gap: 0.4rem;
  padding: 0.6rem 0.75rem;
  border-radius: var(--ink-radius-sm);
  background: var(--ink-green-soft);
  font-size: 0.95rem;
}

.feedback :deep(.lucide) {
  margin-top: 3px;
  color: var(--ink-green);
}

.working {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  text-align: center;
}

.prompt {
  display: block;
  margin-bottom: 0.75rem;
  font-family: var(--ink-font-display);
  font-size: 1.35rem;
  font-weight: 500;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.finish,
.done {
  text-align: center;
}

.finish h2 {
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
}

.finish .v-btn {
  margin-top: 1.25rem;
}

.done {
  padding: clamp(1.75rem, 5vw, 3rem);
}

.done h1 {
  margin-bottom: 0.75rem;
  font-size: clamp(1.75rem, 4vw, 2.4rem);
  color: var(--ink-primary-strong);
  outline: none;
}

.done-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.25rem;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--ink-pink-soft);
  color: var(--ink-pink);
}

.done-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 2rem;
}

@media (max-width: 600px) {
  .sentence-card {
    grid-template-columns: 1fr;
  }

  .sentence-media img,
  .no-image {
    min-height: 0;
    aspect-ratio: 4 / 3;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .form-actions .v-btn {
    width: 100%;
  }
}
</style>
