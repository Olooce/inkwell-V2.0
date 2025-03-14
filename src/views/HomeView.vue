<template>
    <div class="home-container">
      <div class="content">
        <div class="logo">inkwell</div>
        <div class="text-content">
          <h1 class="title">Unleash your</h1>
          <h1 class="creativity">CREATIVITY!</h1>
          <v-btn
            class="get-started-btn"
            to="/signup"
          >
            Get Started
          </v-btn>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  </script>
  
  <style scoped>
  .home-container {
    width: 100vw;
    height: 100vh;
    background-image: url('@/assets/images/home/hero-image-darkened.jpg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-color: rgb(142, 177, 182);
    display: flex;
    flex-direction: column;
    position: relative;
  }
  
  .content {
    height: 100%;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    z-index: 1;
  }
  
  .logo {
    color: white;
    font-family: 'Fredoka', sans-serif;
    font-size: 2.5rem;
    font-weight: 500;
  }
  
  .text-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
  
  .title {
    color: white;
    font-family: 'Fredoka', sans-serif;
    font-size: 3.5rem;
    font-weight: 500;
    margin-bottom: 1rem;
  }
  
  .creativity {
  color: white;
  font-family: 'Fredoka', sans-serif;
  font-size: 4.5rem;
  font-weight: 700; /* Increased weight to match mockup */
  margin-bottom: 2rem;
  letter-spacing: 2px; /* Added letter spacing */
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1); /* Subtle text shadow */
}
  
  .get-started-btn {
  background: transparent !important;
  color: white !important;
  border: 2px solid white !important;
  font-family: 'Fredoka', sans-serif !important;
  font-size: 1.25rem !important;
  padding: 0.5rem 3rem !important; /* Adjusted padding */
  text-transform: none !important;
  letter-spacing: 0.5px !important;
  border-radius: 8px !important; /* More subtle rounded corners */
  height: auto !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  min-width: 200px !important; /* Ensure minimum width */
}
  
  @media (max-width: 768px) {
    .logo {
      font-size: 2rem;
    }
  
    .title {
      font-size: 2.5rem;
    }
  
    .creativity {
      font-size: 3.5rem;
    }
  }
  
  @media (max-width: 480px) {
    .content {
      padding: 1rem;
    }
  
    .title {
      font-size: 2rem;
    }
  
    .creativity {
      font-size: 2.5rem;
    }
  
    .get-started-btn {
      font-size: 1rem !important;
      padding: 0.5rem 2rem !important;
    }
  }
  </style>