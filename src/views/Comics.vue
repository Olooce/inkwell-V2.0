<template>
    <div class="comics-layout">
      <Navigation :user-name="userName" />
      
      <main class="comics-content">
        <div class="comics-grid">
          <div v-for="comic in comics" 
               :key="comic.id" 
               class="comic-card">
            <img 
              :src="comic.thumbnail" 
              alt="Comic thumbnail" 
              class="comic-thumbnail"
            />
            <div class="comic-info">
              <h2 class="comic-title">{{ comic.title }}</h2>
              <p class="comic-date">Done on: {{ comic.date }}</p>
              <div class="comic-links">
                <router-link :to="`/comics/${comic.id}`" class="action-link">View</router-link>
                <span class="separator">|</span>
                <a :href="comic.downloadUrl" class="action-link">Download</a>
              </div>
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
  
  const comics = ref([
    {
      id: 1,
      title: 'A Day at the Zoo',
      date: '27/11/2024',
    //   thumbnail: 'https://your-api.com/comics/thumbnails/day-at-zoo.png',
    thumbnail: '/src/assets/images/comics/thumbnail-1.jpg',
      downloadUrl: '#'
    },
    {
      id: 2,
      title: 'Horrible Experience',
      date: '29/11/2024',
      thumbnail: '/src/assets/images/comics/thumbnail-2.jpg',
      downloadUrl: '#'
    }
  ])
  </script>
  
  <style scoped>

  .comics-layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: var(--color-white);
  }
  
  .comics-content {
    padding: 2rem 4rem;
    margin: 0 auto;
    width: 100%;
    margin-top: 80px;
  }
  
  .comics-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 2rem 3rem;
    padding: 1rem;
    max-width: 1400px;
    margin: 0 auto;
  }
  
  .comic-card {
    background-color: rgba(255, 222, 180, 0.6); /* Light peach color */
    border-radius: 16px;
    padding: 1.5rem;
    display: flex;
    gap: 1.5rem;
    align-items: center;
    max-width: 600px;
    justify-self: stretch;
  }
  
  .comic-thumbnail {
    width: 200px;
    height: 150px;
    object-fit: cover;
    border-radius: 8px;
  }
  
  .comic-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .comic-title {
    font-family: 'Fredoka', sans-serif;
    font-size: 1.5rem;
    color: var(--color-black);
    margin: 0;
  }
  
  .comic-date {
    font-family: 'Fredoka', sans-serif;
    color: var(--color-black);
    margin: 0;
  }
  
  .comic-links {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    margin-top: 0.5rem;
  }
  
  .action-link {
    color: var(--color-light-blue);
    text-decoration: underline;
    font-family: 'Fredoka', sans-serif;
  }
  
  .separator {
    color: var(--color-light-blue);
  }
  
  @media (max-width: 1200px) {
    .comics-content {
      padding: 2rem;
    }
    
    .comics-grid {
      gap: 2rem;
    }
    
    .comic-card {
      flex-direction: column;
      text-align: center;
    }
    
    .comic-links {
      justify-content: center;
    }
  }
  
  @media (max-width: 768px) {
    .comics-grid {
      grid-template-columns: 1fr;
    }
    
    .comics-content {
      padding: 1rem;
    }
  }
  </style>