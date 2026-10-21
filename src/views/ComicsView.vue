<template>
  <div class="page">
    <header class="page-header header-row">
      <div>
        <h1>My comics</h1>
        <p>Every story you finish becomes a comic you can read and download.</p>
      </div>
      <v-btn v-if="!loading && comics.length" variant="outlined" :loading="loading" @click="load">
        <RefreshCw :size="18" class="mr-2" /> Refresh
      </v-btn>
    </header>

    <div v-if="loading" class="grid" aria-busy="true" aria-label="Loading comics">
      <v-skeleton-loader v-for="n in 4" :key="n" type="image, article" class="card" />
    </div>

    <div v-else-if="error" class="state-panel" role="alert">
      <CircleAlert :size="36" />
      <h2>We couldn’t load your comics</h2>
      <p>{{ error }}</p>
      <v-btn color="primary" @click="load">Try again</v-btn>
    </div>

    <div v-else-if="!comics.length" class="state-panel">
      <img src="/assets/images/dashboard/comic.png" alt="" width="120" />
      <h2>No comics yet</h2>
      <p>
        Finish a story and we’ll turn it into a comic for you. Just finished one? It can take a
        minute or two to appear.
      </p>
      <div class="empty-actions">
        <v-btn color="primary" size="large" to="/create-story">Write a story</v-btn>
        <v-btn variant="outlined" size="large" @click="load">Check again</v-btn>
      </div>
    </div>

    <ul v-else class="grid">
      <li v-for="comic in comics" :key="comic.id" class="card comic">
        <a
          :href="assetUrl(comic.view_url)"
          target="_blank"
          rel="noopener"
          class="thumb-link"
          tabindex="-1"
          aria-hidden="true"
          @click.prevent="openComic(comic)"
        >
          <img
            v-if="comic.thumbnail && !brokenImages[comic.id]"
            :src="assetUrl(comic.thumbnail)"
            alt=""
            loading="lazy"
            @error="brokenImages[comic.id] = true"
          />
          <div v-else class="no-thumb"><BookOpen :size="40" /></div>
        </a>
        <div class="comic-body">
          <h2>{{ comic.title || 'Untitled story' }}</h2>
          <p class="date">Finished {{ formatDate(comic.done_on) }}</p>
          <div class="comic-actions">
            <v-btn
              color="primary"
              :aria-label="`Read ${comic.title} (opens in a new tab)`"
              @click="openComic(comic)"
            >
              <Eye :size="18" class="mr-2" /> Read
            </v-btn>
            <v-btn
              variant="outlined"
              :href="downloadUrl(comic.download_url)"
              download
              :aria-label="`Download ${comic.title} as PDF`"
            >
              <Download :size="18" class="mr-2" /> Download PDF
            </v-btn>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { BookOpen, CircleAlert, Download, Eye, RefreshCw } from '@lucide/vue'
import { toast } from 'vue3-toastify'
import apiClient, { BASE_URL, assetUrl, getErrorMessage } from '@/services/apiClient'

const comics = ref([])
const loading = ref(true)
const error = ref('')
const brokenImages = reactive({})

const downloadUrl = (path) => `${BASE_URL}/download/comics/${(path || '').split('/').pop()}`

// done_on is "YYYY-MM-DD HH:MM:SS" (server time).
const formatDate = (value) => {
  const date = new Date(value?.replace(' ', 'T'))
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })
}

const openComic = async (comic) => {
  const tab = window.open('', '_blank')
  try {
    const response = await fetch(assetUrl(comic.view_url))
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const blob = new Blob([await response.arrayBuffer()], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    if (tab) tab.location.href = url
    else window.location.href = url
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  } catch {
    tab?.close()
    toast.error('We couldn’t open this comic. Try downloading it instead.')
  }
}

const load = async () => {
  loading.value = true
  error.value = ''
  try {
    const { data } = await apiClient.get('/stories/comics')
    // The backend returns null when there are none; show newest first.
    comics.value = (data || []).slice().sort((a, b) => b.id - a.id)
  } catch (err) {
    error.value = getErrorMessage(err)
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.header-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.grid {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}

.comic {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.thumb-link {
  display: block;
  aspect-ratio: 4 / 3;
  background: var(--ink-orange-soft);
}

.thumb-link img,
.no-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.no-thumb {
  display: grid;
  place-items: center;
  color: #b0661a;
}

.comic-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 1rem 1.25rem 1.25rem;
}

.comic-body h2 {
  font-size: 1.3rem;
}

.date {
  color: var(--ink-text-muted);
  font-size: 0.95rem;
}

.comic-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: auto;
  padding-top: 0.75rem;
}

.empty-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
}
</style>
