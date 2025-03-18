<template>
  <div class="comics-layout">
    <Navigation :user-name="userName" />

    <main class="comics-content">
      <div v-if="comics.length > 0" class="comics-grid">
        <div
          v-for="comic in comics"
          :key="comic.id"
          class="comic-card"
        >
          <img
            :src="getImageUrl(comic.thumbnail)"
            :alt="comic.title"
            class="comic-thumbnail"
          />
          <div class="comic-info">
            <h2 class="comic-title">{{ comic.title }}</h2>
            <p class="comic-date">Done on: {{ comic.done_on }}</p>
            <div class="comic-links">
<!--              <a-->
<!--                :href="getImageUrl(comic.view_url)"-->
<!--                class="action-link"-->
<!--                target="_blank"-->
<!--              >-->
<!--                View-->
<!--              </a>-->
<!--              <span class="separator">|</span>-->
              <a
                :href="getDownloadUrl(comic.download_url)"
                class="action-link"
                download
              >
                Download
              </a>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="no-comics-fallback">
        <p class="no-comics-message">
         Your created stories will appear here.  You have no comics created.
        </p>
        <button class="create-story-btn" @click="redirectToCreateStory">
          Create a Story
        </button>
      </div>
    </main>
  </div>
</template>

<script setup>
import Navigation from '@/components/Navigation.vue'
import { ref, onMounted } from 'vue'
import apiClient, { IMAGE_URL } from '@/services/apiClient'
import { useRouter } from 'vue-router'
import { BASE_URL } from '@/services/apiClient'

const userName = ref('Arabella')
const comics = ref([])
const router = useRouter()

// Helper function to handle image URLs
const getImageUrl = (path) => {
  if (!path) return ''
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  return `${IMAGE_URL}/${cleanPath}`
}

const getDownloadUrl = (path) => {
  if (!path) return ''
  let cleanPath = path.startsWith('/') ? path.slice(1) : path

  // Ensure we don't duplicate "comics/"
  if (!cleanPath.startsWith('comics/')) {
    cleanPath = `comics/${cleanPath}`
  }

  return `${BASE_URL}/download/${cleanPath}` // Use backend URL
}




// Fetch comics from API
const fetchComics = async () => {
  try {
    const response = await apiClient.get('/stories/comics')
    comics.value = response.data.map(comic => ({
      ...comic,
      view_url: comic.view_url
        ? comic.view_url.replace(/^https?:\/\/[^\/]+/, '')
        : ''
    }))
    console.log('Fetched comics:', comics.value) // For debugging
  } catch (error) {
    console.error('Error fetching comics:', error)
    comics.value = []
  }
}

const redirectToCreateStory = () => {
  router.push('/create-story')
}

onMounted(() => {
  fetchComics()
})
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

  .no-comics-fallback {
    text-align: center;
    margin-top: 3rem;
  }

  .no-comics-message {
    font-size: 1.2rem;
    color: var(--color-black);
    margin-bottom: 1.5rem;
    font-family: 'Fredoka', sans-serif;
  }

  .create-story-btn {
    padding: 0.8rem 1.5rem;
    font-size: 1.2rem;
    background-color: var(--color-light-blue);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-family: 'Fredoka', sans-serif;
    transition: background-color 0.2s;
  }

  .create-story-btn:hover {
    background-color: var(--color-dark-blue);
  }

  .create-story-btn:active {
    background-color: var(--color-blue);
  }
  </style>
