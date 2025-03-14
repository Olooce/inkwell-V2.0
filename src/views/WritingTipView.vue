<template>
    <div class="tip-view-layout">
      <Navigation :user-name="userName" />
      
      <main class="tip-view-content">
        <div class="tip-header">
          <router-link to="/writing-tips" class="back-link">
            <span class="back-arrow">←</span> Back to Writing Tips
          </router-link>
          <h1 class="tip-title text-medium">{{ currentTip.title }}</h1>
        </div>
  
        <div class="tip-body">
          <div class="explanation-section">
            <h2 class="section-title">What is {{ currentTip.title }}?</h2>
            <p class="explanation">{{ currentTip.explanation }}</p>
          </div>
  
          <div class="examples-section">
            <h2 class="section-title">Examples</h2>
            <div class="examples-grid">
              <div v-for="example in currentTip.examples" 
                   :key="example.id" 
                   class="example-card"
                   :class="{ 'correct': example.type === 'correct', 'incorrect': example.type === 'incorrect' }">
                <div class="example-header">
                  <span class="example-icon">{{ example.type === 'correct' ? '✓' : '×' }}</span>
                  <span class="example-label">{{ example.type === 'correct' ? 'Correct' : 'Incorrect' }}</span>
                </div>
                <p class="example-text">{{ example.text }}</p>
              </div>
            </div>
          </div>
  
          <div class="practice-section">
            <h2 class="section-title">Practice</h2>
            <div class="practice-card">
              <p class="practice-instruction">Try fixing these sentences:</p>
              <div v-for="practice in currentTip.practice" 
                   :key="practice.id"
                   class="practice-item">
                <p class="practice-text">{{ practice.text }}</p>
                <button class="show-answer-btn" @click="practice.showAnswer = !practice.showAnswer">
                  {{ practice.showAnswer ? 'Hide Answer' : 'Show Answer' }}
                </button>
                <p v-if="practice.showAnswer" class="answer-text">{{ practice.answer }}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import Navigation from '@/components/Navigation.vue'
  
  const userName = ref('Arabella')
  const route = useRoute()
  
  // Example data structure for a writing tip
  const currentTip = ref({
    id: route.params.id,
    title: 'Dangling Modifiers',
    explanation: 'A dangling modifier is a word or phrase that modifies a word not clearly stated in the sentence. These modifiers are "dangling" because they don\'t have anything to modify properly.',
    examples: [
      {
        id: 1,
        type: 'incorrect',
        text: 'Walking down the street, the trees were beautiful.'
      },
      {
        id: 2,
        type: 'correct',
        text: 'Walking down the street, I saw the beautiful trees.'
      }
    ],
    practice: [
      {
        id: 1,
        text: 'Running to catch the bus, my wallet fell out.',
        answer: 'While I was running to catch the bus, my wallet fell out.',
        showAnswer: false
      },
      {
        id: 2,
        text: 'Tired from the long day, the bed looked very inviting.',
        answer: 'Tired from the long day, I found the bed very inviting.',
        showAnswer: false
      }
    ]
  })
  
  onMounted(() => {
    // Here you would typically fetch the specific tip data based on route.params.id
  })
  </script>
  
  <style scoped>
  .tip-view-layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: var(--color-white);
  }
  
  .tip-view-content {
    flex: 1;
    padding: 2rem;
    margin: 0 auto;
    width: 100%;
    max-width: 1000px;
    margin-top: 80px;
  }
  
  .tip-header {
    margin-bottom: 3rem;
  }
  
  .back-link {
    display: inline-flex;
    align-items: center;
    color: var(--color-light-blue);
    font-family: 'Fredoka', sans-serif;
    margin-bottom: 1rem;
    text-decoration: none;
  }
  
  .back-arrow {
    margin-right: 0.5rem;
    font-size: 1.2rem;
  }
  
  .tip-title {
    font-family: 'Fredoka', sans-serif;
    font-size: 2.5rem;
    color: var(--color-black);
  }
  
  .section-title {
    font-family: 'Fredoka', sans-serif;
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
    color: var(--color-black);
  }
  
  .explanation-section {
    margin-bottom: 3rem;
  }
  
  .explanation {
    font-size: 1.1rem;
    line-height: 1.6;
  }
  
  .examples-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-bottom: 3rem;
  }
  
  .example-card {
    padding: 1.5rem;
    border-radius: 12px;
    background-color: var(--color-white);
  }
  
  .example-card.correct {
    border: 2px solid var(--color-light-green-29);
  }
  
  .example-card.incorrect {
    border: 2px solid var(--color-red-38);
  }
  
  .example-header {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .example-icon {
    margin-right: 0.5rem;
    font-size: 1.2rem;
  }
  
  .example-label {
    font-family: 'Fredoka', sans-serif;
    font-weight: 500;
  }
  
  .practice-card {
    background-color: var(--color-light-blue-18);
    padding: 2rem;
    border-radius: 16px;
  }
  
  .practice-item {
    margin-bottom: 2rem;
  }
  
  .practice-text {
    margin-bottom: 1rem;
    font-size: 1.1rem;
  }
  
  .show-answer-btn {
    background-color: var(--color-light-blue);
    color: var(--color-white);
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-family: 'Fredoka', sans-serif;
    cursor: pointer;
  }
  
  .answer-text {
    margin-top: 1rem;
    padding: 1rem;
    background-color: var(--color-white);
    border-radius: 8px;
    color: var(--color-dark-blue);
  }
  
  @media (max-width: 768px) {
    .tip-view-content {
      padding: 1rem;
    }
  
    .examples-grid {
      grid-template-columns: 1fr;
    }
  }
  </style>