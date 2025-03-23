<template>
    <div class="dashboard-layout">
      <Navigation :user-name="userName" />

      <main class="dashboard-content">
        <div class="dashboard-grid">
          <router-link to="/writing-tips" class="dashboard-card writing-tips">
            <div class="card-content">
              <h2 class="card-title">Writing tips</h2>
              <img
                src="/assets/images/dashboard/writing-tips.png"
                alt="Writing tips illustration"
                class="card-image"
              />
            </div>
          </router-link>

          <router-link to="/comics" class="dashboard-card comics">
            <div class="card-content">
              <h2 class="card-title">Your Comics</h2>
              <img
                src="/assets/images/dashboard/comic.png"
                alt="Comics illustration"
                class="card-image"
              />
            </div>
          </router-link>

          <router-link to="/create-story" class="dashboard-card create-story">
            <div class="card-content">
              <h2 class="card-title">Create a Story</h2>
              <img
                src="/assets/images/dashboard/create-story.png"
                alt="Create story illustration"
                class="card-image"
              />
            </div>
          </router-link>

          <router-link to="/progress" class="dashboard-card progress">
            <div class="card-content">
              <h2 class="card-title">Progress</h2>
              <img
                src="/assets/images/dashboard/progress.png"
                alt="Progress illustration"
                class="card-image"
              />
            </div>
          </router-link>
        </div>
      </main>
    </div>
  </template>

  <script setup>
  import { ref } from 'vue'
  import Navigation from '@/components/Navigation.vue'

  const userName = ref('Arabella')
  </script>

  <style scoped>
  .dashboard-layout {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: #ffffff;
  }

  .dashboard-content {
    flex: 1;
    padding: 1.5rem;
    margin: 0 auto;
    width: 100%;
    max-width: 1400px;
    /* Account for navigation height */
    height: calc(100vh - 80px);
    margin-top: 80px;
  }

  .dashboard-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: 1fr;
    gap: 1.5rem;
    height: 100%;
  }

  .dashboard-card {
    position: relative;
    border-radius: 24px;
    overflow: hidden;
    text-decoration: none;
    transition: transform 0.3s ease;
  }

  .dashboard-card:hover {
    transform: translateY(-4px);
  }

  .writing-tips {
    background-color: rgba(6, 143, 255, 0.18);
  }

  .comics {
    background-color: rgba(255, 147, 6, 0.38);
  }

  .create-story {
    background-color: rgba(255, 6, 255, 0.18);
  }

  .progress {
    background-color: rgba(43, 255, 6, 0.29);
  }

  .card-content {
    position: relative;
    height: 100%;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }

  .card-title {
    font-family: 'Fredoka', sans-serif;
    font-size: clamp(1.5rem, 2vw, 2rem);
    color: #000;
    z-index: 1;
  }

  .card-image {
    position: absolute;
    right: 0;
    bottom: 0;
    height: 75%;
    width: auto;
    object-fit: contain;
  }

  @media (max-width: 960px) {
    .dashboard-content {
      padding: 1rem;
    }

    .dashboard-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .card-content {
      padding: 1rem;
    }

    .card-image {
      height: 65%;
    }
  }

  @media (max-height: 700px) {
    .dashboard-content {
      padding: 1rem;
    }

    .card-content {
      padding: 1rem;
    }

    .card-title {
      font-size: clamp(1.25rem, 1.5vw, 1.5rem);
    }

    .card-image {
      height: 70%;
    }
  }
  </style>
