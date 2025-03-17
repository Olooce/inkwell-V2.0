<template>
  <div class="create-story-layout">
    <Navigation :user-name="userName" />

    <main class="create-story-content">
      <div v-if="!storyStarted" class="start-story-section">
        <h1 class="page-title">Start Your Story Adventure!</h1>
        <div class="input-container">
          <input
            v-model="storyTitle"
            class="title-input"
            placeholder="Enter your story title..."
            @keyup.enter="startStory"
          />
          <button @click="startStory" class="start-button" :disabled="!storyTitle">
            Begin Story
          </button>
        </div>
      </div>

      <div v-else class="story-writing-section">
        <h1 class="page-title">WARM UP YOUR WRITING SKILLS!</h1>
        <div class="progress-bar">
          <div class="progress-text">
            {{ currentSentenceCount }} of {{ maxSentences }} sentences
          </div>
          <div class="progress-track">
            <div
              class="progress-fill"
              :style="{ width: `${(currentSentenceCount / maxSentences) * 100}%` }"
            ></div>
          </div>
        </div>

        <div class="story-input-section">
          <h2 class="input-prompt">{{ inputPrompt }}</h2>
          <div class="input-container">
            <textarea
              v-model="userSentence"
              class="sentence-input"
              :placeholder="inputPlaceholder"
              @keydown.enter.prevent="verifySentence"
              :disabled="isLoading"
            ></textarea>
          </div>
          <button
            @click="verifySentence"
            class="verify-button"
            :disabled="!userSentence.trim() || isLoading"
          >
            {{ isLoading ? 'Processing...' : 'Verify' }}
          </button>
        </div>

        <!-- Previous Sentences -->
        <div v-if="sentences.length > 0" class="previous-sentences">
          <div
            v-for="sentence in sentences"
            :key="sentence.id"
            class="sentence-card"
          >
            <p class="original-text">{{ sentence.original_text }}</p>
            <p class="corrected-text">{{ sentence.corrected_text }}</p>
            <p class="feedback">{{ sentence.feedback }}</p>
            <img
              v-if="sentence.image_url"
              :src="getSentenceImageUrl(sentence)"
              :alt="sentence.corrected_text"
              class="sentence-image"
            />
          </div>
        </div>

        <!-- Feedback Popup -->
        <div v-if="showFeedback" class="feedback-popup">
          <div class="popup-content">
            <h3 class="popup-title">Feedback</h3>
            <p class="feedback-text">{{ feedbackMessage }}</p>
            <p class="correct-sentence">{{ correctedSentence }}</p>
            <img
              v-if="sentences[currentSentenceCount - 1]?.image_url"
              :src= "currentSentenceImageUrl"
              alt="Generated Story Visual"
              class="popup-image"
            />
            <div class="popup-buttons">
              <button @click="continueToPicture" class="next-button">Next</button>
            </div>
          </div>
        </div>

        <!-- Completion Popup -->
        <div v-if="showCompletionPopup" class="completion-popup">
          <div class="popup-content">
            <h2 class="popup-title">WOWWW!</h2>
            <div class="popup-message">
              <p>YOU DID IT! GREAT JOB!</p>
              <p>Find your story in the comic section.</p>
            </div>
            <button @click="goToComics" class="done-button">
              View Comic
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Navigation from '@/components/Navigation.vue'
import { storyStore } from '@/stores/storyStore.js'
import { userStore } from '@/stores/userStore'
import { IMAGE_URL } from '@/services/apiClient'
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

const router = useRouter()
const userName = computed(() => userStore.state.firstName.value)

// Story state
const storyId = ref(null)
const storyTitle = ref('')
const storyStarted = ref(false)
const maxSentences = ref(0)
const currentSentenceCount = ref(0)
const sentences = ref([])

// UI state
const userSentence = ref('')
const isLoading = ref(false)
const showFeedback = ref(false)
const showCompletionPopup = ref(false)
const feedbackMessage = ref('')
const correctedSentence = ref('')

// Check for saved state on page load
onMounted(() => {
  const savedStoryId = localStorage.getItem('storyId')
  const savedMaxSentences = localStorage.getItem('maxSentences')
  const savedSentenceCount = localStorage.getItem('currentSentenceCount')
  const savedSentences = JSON.parse(localStorage.getItem('sentences'))

  if (savedStoryId) {
    storyId.value = savedStoryId
    maxSentences.value = savedMaxSentences
    currentSentenceCount.value = savedSentenceCount
    sentences.value = savedSentences
    storyStarted.value = true
  }
})

const inputPrompt = computed(() => {
  if (sentences.value.length === 0) {
    return 'Start by typing your first sentence...'
  }
  return 'What happens next?'
})

const inputPlaceholder = computed(() => {
  if (sentences.value.length === 0) {
    return 'Type your first sentence here...'
  }
  return 'Continue your story...'
})

// const canCompleteStory = computed(() => {
//   return sentences.value.length >= 3
// })

// Methods
const startStory = async () => {
  if (!storyTitle.value.trim()) return

  try {
    isLoading.value = true
    const response = await storyStore.startStory(storyTitle.value)
    storyId.value = response.story_id
    maxSentences.value = response.max_sentences
    storyStarted.value = true


    localStorage.setItem('storyId', storyId.value)
    localStorage.setItem('maxSentences', maxSentences.value)
    localStorage.setItem('currentSentenceCount', currentSentenceCount.value)
    localStorage.setItem('sentences', JSON.stringify(sentences.value))

    toast.success("Story started successfully!", { timeout: 3000 })
  } catch (error) {
    toast.error(error.message, { timeout: 3000 })
  } finally {
    isLoading.value = false
  }
}

const verifySentence = async () => {
  if (!userSentence.value.trim() || isLoading.value) return

  try {
    isLoading.value = true
    const response = await storyStore.addSentence(userSentence.value)

    // Add sentence to list
    sentences.value.push(response.sentence)
    currentSentenceCount.value = sentences.value.length

    // Show feedback
    feedbackMessage.value = response.sentence.feedback
    correctedSentence.value = response.sentence.corrected_text
    showFeedback.value = true

    // Save to localStorage
    localStorage.setItem('currentSentenceCount', currentSentenceCount.value)
    localStorage.setItem('sentences', JSON.stringify(sentences.value))

    // Clear input
    userSentence.value = ''
  } catch (error) {
    toast.error(error.message, { timeout: 3000 })
  } finally {
    isLoading.value = false
  }
}

const currentSentenceImageUrl = computed(() => {
  const sentence = sentences.value[currentSentenceCount.value - 1];
  return sentence?.image_url ? `${IMAGE_URL}${sentence.image_url}` : '';
});

const getSentenceImageUrl = (sentence) => {
  if (!sentence?.image_url) {
    return '';
  }
  return `${IMAGE_URL}${sentence.image_url}`;
};

const completeStory = async () => {
  try {
    isLoading.value = true
    await storyStore.completeStory(storyId.value)
    showCompletionPopup.value = true

    localStorage.removeItem('storyId')
    localStorage.removeItem('maxSentences')
    localStorage.removeItem('currentSentenceCount')
    localStorage.removeItem('sentences')
  } catch (error) {
    toast.error(error.message, { timeout: 3000 })
  } finally {
    isLoading.value = false
  }
}

const continueToPicture = () => {
  showFeedback.value = false;
  if (currentSentenceCount.value >= maxSentences.value) {
    completeStory();
  }
};

const goToComics = () => {
  router.push('/comics')
}

</script>

<style scoped>
/* Global Styles */
/*body {
  font-family: 'Fredoka', sans-serif;
  background-color: var(--color-white);
  margin: 0;
  padding: 0;
}*/

.create-story-layout {
  margin-top: 10%;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.create-story-content {
  padding: 2rem;
  margin: 0 auto;
  max-width: 900px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.page-title {
  font-size: 2.5rem;
  color: #FF00FF;
  text-align: center;
  margin-bottom: 2rem;
}

.start-story-section,
.story-writing-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

/* Start Story Section */
.title-input {
  width: 100%;
  padding: 1rem;
  font-size: 1.5rem;
  border: 2px solid #FF69B4;
  border-radius: 12px;
  margin-bottom: 1rem;
  font-family: 'Fredoka', sans-serif;
}

.start-button {
  background-color: #FFE6F7;
  color: var(--color-black);
  border: none;
  border-radius: 12px;
  padding: 1rem 2rem;
  font-size: 1.2rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.start-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Progress Bar */
.progress-bar {
  width: 100%;
  margin-bottom: 2rem;
}

.progress-track {
  width: 100%;
  height: 10px;
  background-color: #FFE6F7;
  border-radius: 5px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #FF69B4;
  transition: width 0.3s ease;
}

.progress-text {
  text-align: center;
  margin-bottom: 0.5rem;
  color: var(--color-black);
  font-size: 1rem;
}

/* Story Writing Section */

.input-container {
  display: flex;
  flex-direction: column;
  align-items: center; /* Horizontally center the content */
  gap: 1rem;
  width: 100%;
}

.start-button,
.verify-button,
.next-button,
.done-button {
  display: block;
  margin: 0 auto; /* Center the button horizontally */
}


.input-prompt {
  font-size: 1.8rem;
  color: var(--color-black);
}

.sentence-input {
  width: 100%;
  height: 120px;
  padding: 1.5rem;
  border: 2px solid #FF69B4;
  border-radius: 24px;
  font-size: 1.5rem;
  resize: none;
  outline: none;
  font-family: 'Fredoka', sans-serif;
}

.verify-button {
  background-color: #FFE6F7;
  color: var(--color-black);
  border: none;
  border-radius: 24px;
  padding: 1rem 4rem;
  font-size: 1.2rem;
  cursor: pointer;
  margin-top: 2rem;
  transition: background-color 0.3s ease;
}

.verify-button:hover {
  background-color: #FFD1F1;
}

/* Previous Sentences Section */
.previous-sentences {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 2rem;
}

.sentence-card {
  background-color: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #FFE6F7;
}

.original-text {
  color: #666;
  font-style: italic;
  margin-bottom: 0.5rem;
}

.corrected-text {
  color: #FF69B4;
  font-weight: 500;
  margin-bottom: 1rem;
}

.feedback {
  background-color: #FFE6F7;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.sentence-image {
  width: 100%;
  max-width: 400px;
  height: auto;
  border-radius: 8px;
  margin: 1rem auto;
  display: block;
}

/* Feedback Popup */
.feedback-popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.popup-content {
  background-color: white;
  padding: 2rem;
  border-radius: 24px;
  max-width: 600px;
  width: 90%;
  border: 2px solid #FF69B4;
}

.popup-title {
  font-size: 2rem;
  color: var(--color-black);
  margin-bottom: 1.5rem;
  text-align: center;
}

.popup-image {
  width: 100%;
  max-width: 200px;
  height: auto;
  border-radius: 16px;
  margin: 1.5rem auto;
  display: block;
}

.feedback-text {
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.correct-sentence {
  font-size: 1.2rem;
  color: #FF00FF;
  margin-bottom: 2rem;
  text-align: center;
}

.next-button {
  background-color: #FFE6F7;
  color: var(--color-black);
  border: none;
  border-radius: 24px;
  padding: 1rem 3rem;
  font-size: 1.2rem;
  cursor: pointer;
  display: block;
  margin: 0 auto;
  transition: background-color 0.3s ease;
}

.next-button:hover {
  background-color: #FFD1F1;
}

.popup-buttons {
  display: flex;
  justify-content: center; /* Horizontally center the buttons */
  gap: 1rem; /* Space between buttons */
}

.next-button,
.done-button {
  display: block;
  margin: 0 auto; /* Ensure the button is centered */
}


/* Completion Popup */
.completion-popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.popup-content {
  background-color: white;
  padding: 2rem;
  border-radius: 24px;
  max-width: 600px;
  width: 90%;
  border: 2px solid #FF69B4;
  text-align: center;
}

.popup-message {
  font-size: 1.5rem;
  color: var(--color-black);
  margin-bottom: 1.5rem;
}

.done-button {
  background-color: #FF69B4;
  color: white;
  border: none;
  border-radius: 24px;
  padding: 1rem 2rem;
  font-size: 1.2rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.done-button:hover {
  background-color: #FF1493;
}

/* Responsive Design */
@media (max-width: 768px) {
  .create-story-content {
    padding: 1rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .input-prompt {
    font-size: 1.5rem;
  }

  .sentence-input {
    font-size: 1.2rem;
  }

  .start-story-section {
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
    text-align: center;
  }

  .title-input {
    width: 100%;
    padding: 1rem;
    font-size: 1.2rem;
    border: 2px solid #FF69B4;
    border-radius: 12px;
    margin-bottom: 1rem;
  }

  .start-button {
    padding: 1rem 2rem;
    font-size: 1.2rem;
  }

  .progress-bar {
    margin-bottom: 1.5rem;
  }

  .popup-content {
    padding: 1.5rem;
  }

  .popup-title {
    font-size: 1.8rem;
  }

  .next-button {
    padding: 1rem 2.5rem;
  }

  .done-button {
    padding: 1rem 2rem;
  }
}
</style>
