<template>
  <div class="page">
    <header class="page-header">
      <h1>{{ greeting }}, {{ userStore.displayName.value }}!</h1>
      <p>What would you like to do today?</p>
    </header>

    <router-link v-if="activeStory" to="/create-story" class="resume card">
      <div class="resume-icon" aria-hidden="true"><Pencil :size="28" /></div>
      <div class="resume-text">
        <span class="resume-label">Continue your story</span>
        <strong>{{ activeStory.title }}</strong>
        <span class="resume-meta">
          {{ activeStory.sentenceCount }} of {{ activeStory.maxSentences }} sentences written
        </span>
      </div>
      <ArrowRight :size="24" class="resume-arrow" />
    </router-link>

    <nav aria-label="Activities">
      <ul class="tiles">
        <li v-for="tile in tiles" :key="tile.to">
          <router-link :to="tile.to" class="tile" :class="tile.tone">
            <img :src="tile.image" alt="" class="tile-image" />
            <div class="tile-text">
              <h2>{{ tile.title }}</h2>
              <p>{{ tile.description }}</p>
            </div>
          </router-link>
        </li>
      </ul>
    </nav>

    <ChatAssistant />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ArrowRight, Pencil } from '@lucide/vue'
import ChatAssistant from '@/components/ChatAssistant.vue'
import { userStore } from '@/stores/userStore'
import { storyStore } from '@/stores/storyStore'

const hour = new Date().getHours()
const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

const tiles = [
  {
    to: '/create-story',
    title: 'Write a story',
    description: 'Write five sentences and get grammar help and a picture for each one.',
    image: '/assets/images/dashboard/create-story.png',
    tone: 'tone-pink',
  },
  {
    to: '/comics',
    title: 'My comics',
    description: 'Your finished stories, turned into comics you can read and download.',
    image: '/assets/images/dashboard/comic.png',
    tone: 'tone-orange',
  },
  {
    to: '/writing-tips',
    title: 'Writing tips',
    description: 'Feedback and tips based on the stories you’ve written.',
    image: '/assets/images/dashboard/writing-tips.png',
    tone: 'tone-blue',
  },
  {
    to: '/progress',
    title: 'My progress',
    description: 'See your scores and how your writing is improving.',
    image: '/assets/images/dashboard/progress.png',
    tone: 'tone-green',
  },
]

const activeStory = ref(null)

onMounted(async () => {
  try {
    activeStory.value = await storyStore.getActiveStory()
  } catch {
    // Not critical: the banner simply doesn't show.
  }
})
</script>

<style scoped>
/* Leave room so the floating chat button never covers the last tile. */
.page {
  padding-bottom: 6rem;
}

.resume {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  margin-bottom: 1.5rem;
  color: inherit;
  text-decoration: none;
  border-color: var(--ink-primary);
  background: var(--ink-primary-soft);
  transition: transform 0.15s;
}

.resume:hover {
  transform: translateY(-2px);
}

.resume-icon {
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--ink-primary);
  color: #fff;
}

.resume-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.resume-label {
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--ink-primary-strong);
}

.resume-text strong {
  font-family: var(--ink-font-display);
  font-size: 1.25rem;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.resume-meta {
  color: var(--ink-text-muted);
  font-size: 0.95rem;
}

.resume-arrow {
  margin-left: auto;
  color: var(--ink-primary);
}

.tiles {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.25rem;
}

.tile {
  height: 100%;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.5rem;
  border-radius: var(--ink-radius-lg);
  color: var(--ink-text);
  text-decoration: none;
  border: 2px solid transparent;
  transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
}

.tile:hover {
  transform: translateY(-3px);
  box-shadow: var(--ink-shadow-lg);
}

.tile:focus-visible {
  border-color: var(--ink-sky);
}

.tile-image {
  width: clamp(96px, 14vw, 150px);
  aspect-ratio: 1;
  object-fit: contain;
  flex-shrink: 0;
}

.tile h2 {
  font-size: clamp(1.35rem, 2.5vw, 1.75rem);
  margin-bottom: 0.35rem;
}

.tile p {
  color: var(--ink-text-muted);
}

.tone-pink {
  background: var(--ink-pink-soft);
}

.tone-orange {
  background: var(--ink-orange-soft);
}

.tone-blue {
  background: var(--ink-sky-soft);
}

.tone-green {
  background: var(--ink-green-soft);
}

@media (max-width: 760px) {
  .tiles {
    grid-template-columns: 1fr;
    gap: 0.9rem;
  }

  .tile {
    padding: 1rem 1.25rem;
  }

  .tile-image {
    width: 76px;
  }
}
</style>
