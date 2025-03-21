// src/views/ComicDetail.vue
<template>
  <div class="comic-detail-layout">
    <Navigation :user-name="userName" />

    <main class="comic-detail-content">
      <!-- Navigation Header -->
      <div class="navigation-header">
        <router-link to="/comics" class="back-link">
          <span class="back-arrow">←</span> Back to Comics
        </router-link>
        <h1 class="comic-title">{{ comic?.title }}</h1>
      </div>

      <!-- Comic Viewer -->
      <div class="comic-viewer">
        <object
          v-if="comic?.comic_file"
          :data="comic.comic_file"
          type="application/pdf"
          class="pdf-viewer"
        >
          <div class="pdf-fallback">
            <p>Unable to display PDF. Please download to view.</p>
            <a
              :href="comic.comic_file"
              download
              class="download-button"
            >
              Download Comic
            </a>
          </div>
        </object>
      </div>

      <!-- Comic Actions -->
      <div class="comic-actions">
        <a
          :href="comic?.comic_file"
          download
          class="action-button download"
        >
          Download Comic
        </a>
        <button
          @click="shareComic"
          class="action-button share"
        >
          Share Comic
        </button>
      </div>

      <!-- Share Dialog -->
      <div v-if="showShareDialog" class="share-dialog">
        <div class="dialog-content">
          <h2>Share Your Comic</h2>
          <div class="share-options">
            <button @click="shareViaEmail" class="share-option">
              Email
            </button>
            <button @click="copyLink" class="share-option">
              Copy Link
            </button>
          </div>
          <button @click="showShareDialog = false" class="close-button">
            Close
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import Navigation from '@/components/Navigation.vue'
import { userStore } from '@/stores/userStore'
import { toast } from 'vue3-toastify/index'

const route = useRoute()
const comic = ref(null)
const showShareDialog = ref(false)

const userName = computed(() => userStore.state.firstName.value)

onMounted(async () => {
  try {
    // In a real implementation, fetch comic data using the ID from route.params.id
    comic.value = {
      id: route.params.id,
      title: 'My Awesome Comic',
      comic_file: '/path/to/comic.pdf', // This would come from your API
      thumbnail: '/path/to/thumbnail.jpg'
    }
  } catch (error) {
    toast.error(error.message)
  }
})

const shareComic = () => {
  showShareDialog.value = true
}

const shareViaEmail = () => {
  const subject = encodeURIComponent(comic.value.title)
  const body = encodeURIComponent(`Check out my comic: ${window.location.href}`)
  window.location.href = `mailto:?subject=${subject}&body=${body}`
  showShareDialog.value = false
}

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href)
    alert('Link copied to clipboard!')
    showShareDialog.value = false
  } catch (error) {
    toast.error(error.message)
  }
}
</script>

<style scoped>
.comic-detail-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--color-white);
}

.comic-detail-content {
  padding: 2rem;
  margin: 0 auto;
  width: 100%;
  max-width: 1200px;
  margin-top: 80px;
}

.navigation-header {
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  gap: 2rem;
}

.back-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: var(--color-light-blue);
  font-family: 'Fredoka', sans-serif;
  gap: 0.5rem;
}

.back-arrow {
  font-size: 1.5rem;
}

.comic-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 2rem;
  margin: 0;
}

.comic-viewer {
  width: 100%;
  height: 800px;
  border-radius: 16px;
  overflow: hidden;
  background-color: #f5f5f5;
  margin-bottom: 2rem;
}

.pdf-viewer {
  width: 100%;
  height: 100%;
  border: none;
}

.pdf-fallback {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.comic-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.action-button {
  padding: 0.75rem 1.5rem;
  border-radius: 24px;
  font-family: 'Fredoka', sans-serif;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.action-button.download {
  background-color: #FF69B4;
  color: white;
  border: none;
}

.action-button.share {
  background-color: white;
  color: #FF69B4;
  border: 2px solid #FF69B4;
}

.share-dialog {
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

.dialog-content {
  background-color: white;
  padding: 2rem;
  border-radius: 24px;
  max-width: 400px;
  width: 90%;
}

.share-options {
  display: flex;
  gap: 1rem;
  margin: 1.5rem 0;
}

.share-option {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #FF69B4;
  border-radius: 12px;
  background-color: white;
  color: #FF69B4;
  font-family: 'Fredoka', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
}

.share-option:hover {
  background-color: #FF69B4;
  color: white;
}

.close-button {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 12px;
  background-color: #f5f5f5;
  color: #666;
  font-family: 'Fredoka', sans-serif;
  cursor: pointer;
}

@media (max-width: 768px) {
  .comic-detail-content {
    padding: 1rem;
  }

  .comic-viewer {
    height: 500px;
  }

  .comic-actions {
    flex-direction: column;
  }

  .action-button {
    width: 100%;
    text-align: center;
  }

  .share-options {
    flex-direction: column;
  }
}
</style>
