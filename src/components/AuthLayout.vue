<template>
  <div class="auth-layout">
    <aside class="auth-art" aria-hidden="true">
      <img :src="image" alt="" />
      <div class="art-caption">
        <span class="art-brand">inkwell</span>
        <p>Write stories, practise grammar, and watch your words become comics.</p>
      </div>
    </aside>

    <section class="auth-panel">
      <router-link to="/" class="auth-brand">inkwell</router-link>
      <div class="auth-form">
        <h1>{{ title }}</h1>
        <p class="auth-subtitle"><slot name="subtitle" /></p>
        <slot />
      </div>
    </section>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  image: { type: String, default: '/assets/images/auth/kid-pencil.jpg' },
})
</script>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  background: var(--ink-surface);
}

.auth-art {
  position: relative;
  margin: 1.25rem;
  border-radius: var(--ink-radius-lg);
  overflow: hidden;
}

.auth-art img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.art-caption {
  position: absolute;
  inset: auto 0 0 0;
  padding: 2rem;
  color: #fff;
  background: linear-gradient(transparent, rgba(16, 16, 40, 0.75));
}

.art-brand {
  font-family: var(--ink-font-display);
  font-size: 2rem;
  font-weight: 600;
}

.art-caption p {
  font-size: 1.15rem;
  max-width: 32ch;
}

.auth-panel {
  display: flex;
  flex-direction: column;
  padding: 2rem 1.5rem;
}

.auth-brand {
  display: none;
  font-family: var(--ink-font-display);
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--ink-primary);
  text-decoration: none;
}

.auth-form {
  width: 100%;
  max-width: 440px;
  margin: auto;
}

.auth-form h1 {
  font-size: clamp(2rem, 5vw, 2.75rem);
  font-weight: 500;
}

.auth-subtitle {
  margin: 0.5rem 0 2rem;
  color: var(--ink-text-muted);
}

.auth-subtitle :deep(a) {
  color: var(--ink-primary);
  font-weight: 700;
}

@media (max-width: 900px) {
  .auth-layout {
    grid-template-columns: 1fr;
  }

  .auth-art {
    display: none;
  }

  .auth-brand {
    display: block;
  }

  .auth-form {
    margin-top: 2.5rem;
  }
}
</style>
