// src/views/StoryPicture.vue
<template>
  <div class="story-picture-layout">
    <Navigation :user-name="userName" />

    <main class="story-picture-content">
      <!-- Story Progress -->
      <div class="story-progress">
        <div class="progress-indicator">
          <div
            v-for="(sentence, index) in sentences"
            :key="index"
            class="progress-dot"
            :class="{
              'active': index === currentIndex,
              'completed': index < currentIndex
            }"
            @click="goToSentence(index)"
          ></div>
        </div>
        <div class="progress-text">
          Sentence {{ currentIndex + 1 }} of {{ sentences.length }}
        </div>
      </div>

      <!-- Current Sentence Display -->
      <div class="sentence-display">
        <p class="original-text">Original: {{ currentSentence.original_text }}</p>
        <p class="corrected-text">Corrected: {{ currentSentence.corrected_text }}</p>
        <div class="feedback-box">
          {{ currentSentence.feedback }}
        </div>
      </div>

      <!-- Image Display -->
      <div class="image-container">
        <div v-if="currentSentence.image_url" class="image-wrapper">
          <img
            :src="currentSentence.image_url"
            :alt="currentSentence.corrected_text"
            class="story-image"
            @load="handleImageLoad"
          />
        </div>
        <div v-else class="image-placeholder">
          <span>Loading image...</span>
        </div>
      </div>

      <!-- Navigation Buttons -->
      <div class="navigation-buttons">
        <button
          v-if="currentIndex > 0"
          @click="previousSentence"
          class="nav-button previous"
        >
          Previous
        </button>

        <button
          v-if="currentIndex < sentences.length - 1"
          @click="nextSentence"
          class="nav-button next"
        >
          Next
        </button>

        <button
          v-else
          @click="completeStory"
          class="complete-button"
          :disabled="isCompleting"
        >
          {{ isCompleting ? 'Creating Comic...' : 'Complete Story' }}
        </button>
      </div>

      <!-- Completion Popup -->
      <div v-if="showCompletionPopup" class="completion-popup">
        <div class="popup-content">
          <h2 class="popup-title">FANTASTIC WORK!</h2>
          <div class="popup-message">
            <p>Your story has been transformed into a comic!</p>
            <p>Would you like to see it now?</p>
          </div>
          <div class="popup-buttons">
            <button @click="goToComics" class="primary-button">
              View Comic
            </button>
            <button @click="goToDashboard" class="secondary-button">
              Back to Dashboard
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

const router = useRouter()
const userName = computed(() => userStore.state.firstName.value)

// State
const sentences = ref([])
const currentIndex = ref(0)
const isCompleting = ref(false)
const showCompletionPopup = ref(false)
const imageLoaded = ref(false)

// Computed
const currentSentence = computed(() =>
  sentences.value[currentIndex.value] || {}
)

// Methods
const goToSentence = (index) => {
  if (index <= sentences.value.length - 1) {
    currentIndex.value = index
  }
}

const previousSentence = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

const nextSentence = () => {
  if (currentIndex.value < sentences.value.length - 1) {
    currentIndex.value++
  }
}

const handleImageLoad = () => {
  imageLoaded.value = true
}

const completeStory = async () => {
  try {
    isCompleting.value = true
    const response = await storyStore.completeStory(sentences.value[0].story_id)
    showCompletionPopup.value = true
  } catch (error) {
    alert(error.message)
  } finally {
    isCompleting.value = false
  }
}

const goToComics = () => {
  router.push('/comics')
}

const goToDashboard = () => {
  router.push('/dashboard')
}

// Load story data
onMounted(() => {
  // In a real implementation, you'd get this data from your state management
  // For now, we're using mock data
  sentences.value = [
    {
      id: 1,
      original_text: "The happy dinosaur played in park.",
      corrected_text: "The happy dinosaur played in the park.",
      feedback: "Great sentence! I added 'the' before 'park' to make it grammatically correct.",
      image_url: "/api/placeholder/600/400"
    },
    // Add more sentences as needed
  ]
})
</script>

<style scoped>
.story-picture-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--color-white);
}

.story-picture-content {
  padding: 2rem;
  margin: 0 auto;
  width: 100%;
  max-width: 800px;
  margin-top: 80px;
}

.story-progress {
  margin-bottom: 2rem;
  text-align: center;
}

.progress-indicator {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.progress-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #FFE6F7;
  cursor: pointer;
  transition: all 0.3s ease;
}

.progress-dot.active {
  background-color: #FF69B4;
  transform: scale(1.2);
}

.progress-dot.completed {
  background-color: #FF69B4;
  opacity: 0.5;
}

.sentence-display {
  background-color: white;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
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

.feedback-box {
  background-color: #FFE6F7;
  padding: 1rem;
  border-radius: 8px;
}

.image-container {
  width: 100%;
  height: 400px;
  margin: 2rem 0;
  border-radius: 16px;
  overflow: hidden;
  background-color: #f5f5f5;
}

.image-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.story-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
  color: #666;
}

.navigation-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}

.nav-button {
  padding: 0.75rem 1.5rem;
  border: 2px solid #FF69B4;
  border-radius: 24px;
  background-color: white;
  color: #FF69B4;
  font-family: 'Fredoka', sans-serif;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-button:hover {
  background-color: #FFE6F7;
}

.complete-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 24px;
  background-color: #FF69B4;
  color: white;
  font-family: 'Fredoka', sans-serif;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.complete-button:hover:not(:disabled) {
  background-color: #FF1493;
}

.complete-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.completion-popup {
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
  max-width: 500px;
  width: 90%;
  text-align: center;
}

.popup-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 2rem;
  color: #FF69B4;
  margin-bottom: 1rem;
}

.popup-message {
  margin-bottom: 2rem;
}

.popup-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.primary-button,
.secondary-button {
  padding: 0.75rem 1.5rem;
  border-radius: 24px;
  font-family: 'Fredoka', sans-serif;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.primary-button {
  background-color: #FF69B4;
  color: white;
  border: none;
}

.secondary-button {
  background-color: white;
  color: #FF69B4;
  border: 2px solid #FF69B4;
}

@media (max-width: 768px) {
  .story-picture-content {
    padding: 1rem;
  }

  .navigation-buttons {
    flex-direction: column;
    gap: 0.5rem;
  }

  .nav-button,
  .complete-button {
    width: 100%;
  }

  .popup-buttons {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
