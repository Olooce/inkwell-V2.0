<template>
    <div class="assessment-layout">
      <Navigation :user-name="userName" />
      
      <main class="assessment-content">
        <div class="assessment-card">
          <h1 class="title">HEY THERE!</h1>
          <p class="message">
            It's your first time using inkwell, welcome! Get ready for an amazing adventure. 
            To begin, you need to answer a few questions.
          </p>
          <p class="sub-message">Let's dive right in!</p>
          
          <v-btn
            class="start-btn"
            :loading="loading"
            :disabled="loading"
            @click="startAssessment"
            color="primary"
            size="large"
          >
            {{ loading ? 'Loading...' : 'START' }}
          </v-btn>
        </div>
  
        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          class="mt-4"
        >
          {{ error }}
        </v-alert>
      </main>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import Navigation from '@/components/Navigation.vue'
  import { userStore } from '@/stores/userStore'
//   import { assessmentService } from '@/services/assessmentService' - NO NEED FOR THIS
  import { assessmentStore } from '@/stores/assessmentStore'
  
  const router = useRouter()
  const userName = ref(userStore.state.firstName.value || 'Guest')
  const loading = ref(false)
  const error = ref('')
  
  const startAssessment = async () => {
    loading.value = true
    error.value = ''
    
    try {
      // Use assessment service to start assessment
      const data = await assessmentStore.startAssessment()
      console.log(data)
      
      // Store session data in assessment store
      assessmentStore.state.currentSession.value = data.session_id
      assessmentStore.state.questions.value = data.questions
      assessmentStore.state.currentQuestionIndex.value = 0
      
      // Navigate to first question
      router.push('/assessment/question')
    } catch (err) {
      console.error('Error starting assessment:', err)
      error.value = err.message || 'Failed to start assessment'
    } finally {
      loading.value = false
    }
  }
  </script>
  

<style scoped>
.assessment-layout {
  min-height: 100vh;
  background-color: white;
}

.assessment-content {
  padding: 2rem;
  margin: 0 auto;
  max-width: 800px;
  margin-top: 80px;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.assessment-card {
  background: white;
  border-radius: 24px;
  padding: 3rem;
  text-align: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.title {
  font-family: 'Fredoka', sans-serif;
  font-size: 2.5rem;
  color: #4F46E5;
  margin-bottom: 2rem;
}

.message {
  font-size: 1.2rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  color: #333;
}

.sub-message {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.5rem;
  margin-bottom: 2rem;
  color: #6366F1;
}

.start-btn {
  background-color: #2563EB;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 1rem 4rem;
  font-size: 1.2rem;
  font-family: 'Fredoka', sans-serif;
  cursor: pointer;
  transition: all 0.2s;
}

.start-btn:hover:not(:disabled) {
  background-color: #1D4ED8;
  transform: translateY(-1px);
}

.start-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-message {
  background-color: #FEE2E2;
  border: 1px solid #FCA5A5;
  color: #DC2626;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  font-family: 'Fredoka', sans-serif;
}
</style>