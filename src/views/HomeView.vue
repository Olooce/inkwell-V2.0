<template>
  <div class="home">
    <header class="home-header">
      <span class="logo">inkwell</span>
      <router-link to="/login" class="header-login">Log in</router-link>
    </header>

    <section class="hero">
      <h1>
        Unleash your
        <span class="highlight">creativity!</span>
      </h1>
      <p class="tagline">
        Write a story one sentence at a time, get friendly grammar help, and see it turned into
        your very own comic.
      </p>
      <div class="actions">
        <router-link to="/signup" class="btn btn-primary">Get started - it’s free</router-link>
        <router-link to="/login" class="btn btn-ghost">I already have an account</router-link>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  color: #fff;
  background:
    linear-gradient(rgba(14, 14, 40, 0.35), rgba(14, 14, 40, 0.55)),
    url('/assets/images/home/hero-image-darkened.jpg') center / cover no-repeat,
    #5b7b80;
}

.home-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
}

.logo {
  font-family: var(--ink-font-display);
  font-size: 2.25rem;
  font-weight: 600;
}

.header-login {
  color: #fff;
  font-weight: 700;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.6);
}

.header-login:hover {
  background: rgba(255, 255, 255, 0.15);
}

.hero {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  padding: 2rem 1.5rem 4rem;
  text-align: center;
}

.hero h1 {
  font-size: clamp(2.25rem, 6vw, 3.75rem);
  font-weight: 500;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.25);
}

.highlight {
  display: block;
  font-size: clamp(3rem, 9vw, 5.5rem);
  font-weight: 700;
  letter-spacing: 1px;
}

.tagline {
  max-width: 48ch;
  font-size: clamp(1.05rem, 2.2vw, 1.25rem);
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.35);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 52px;
  padding: 0 1.75rem;
  border-radius: 999px;
  font-family: var(--ink-font-display);
  font-size: 1.15rem;
  font-weight: 500;
  text-decoration: none;
  transition: transform 0.15s, background-color 0.15s;
}

.btn-primary {
  background: #fff;
  color: var(--ink-primary-strong);
}

.btn-primary:hover {
  transform: translateY(-1px);
}

.btn-ghost {
  color: #fff;
  border: 2px solid rgba(255, 255, 255, 0.8);
}

.btn-ghost:hover {
  background: rgba(255, 255, 255, 0.15);
}

@media (max-width: 480px) {
  .header-login {
    display: none;
  }

  .actions {
    flex-direction: column;
    width: 100%;
  }
}
</style>
