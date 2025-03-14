<template>
    <div class="writing-tips-layout">
      <Navigation :user-name="userName" />
      
      <main class="writing-tips-content">
        <h1 class="page-title">Writing Tips</h1>
        
        <div class="tips-grid">
          <div v-for="tip in writingTips" 
               :key="tip.id" 
               class="tip-card">
            <div class="tip-content">
              <h2 class="tip-title">{{ tip.title }}</h2>
              <router-link :to="`/writing-tips/${tip.id}`" class="view-link">
                View
              </router-link>
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
  
  const writingTips = ref([
    { id: 1, title: 'Spelling' },
    { id: 2, title: 'Punctuation' },
    { id: 3, title: 'Dangling Modifiers' },
    { id: 4, title: 'Subject Verb Agreement' }
  ])
  </script>
  
  <style scoped>
  .writing-tips-layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: var(--color-white);
  }
  
  .writing-tips-content {
    padding: 2rem 4rem;  /* Increased horizontal padding */
    margin: 0 auto;
    width: 100%;
    margin-top: 80px;
  }
  
  .page-title {
    font-family: 'Fredoka', sans-serif;
    font-size: 2rem;
    margin-bottom: 2rem;
    margin-left: 1rem;  /* Align with grid */
    color: var(--color-black);
  }
  
  .tips-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 2rem 3rem;  /* Increased horizontal gap */
    padding: 1rem;
    max-width: 1400px;  /* Increased max-width */
    margin: 0 auto;
  }
  
  .tip-card {
    background-color: rgba(6, 143, 255, 0.18);
    border-radius: 16px;
    padding: 1.5rem 2rem;
    height: 80px;  /* Reduced height */
    display: flex;
    align-items: center;
    max-width: 600px;  /* Added max-width to cards */
    justify-self: stretch;  /* Makes cards fill their grid cell */
  }
  
  .tip-content {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .tip-title {
    font-family: 'Fredoka', sans-serif;
    font-size: 1.5rem;
    color: var(--color-black);
  }
  
  .view-link {
    color: var(--color-light-blue);
    text-decoration: underline;
    font-family: 'Fredoka', sans-serif;
  }
  
  @media (max-width: 1024px) {
    .writing-tips-content {
      padding: 2rem;
    }
    
    .tips-grid {
      gap: 2rem;
    }
  }
  
  @media (max-width: 768px) {
    .tips-grid {
      grid-template-columns: 1fr;
    }
    
    .writing-tips-content {
      padding: 1rem;
    }
  }
  </style>