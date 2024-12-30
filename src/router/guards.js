import { userStore } from '@/stores/userStore'
import { authService } from '@/services/authService'

export const authGuard = (to, from, next) => {
  // Public pages that don't require auth
  const publicPages = ['/', '/login', '/signup']
  const authRequired = !publicPages.includes(to.path)

  // Check if user is trying to access auth page while logged in
  if (authService.isAuthenticated() && publicPages.includes(to.path)) {
    next('/dashboard')
    return
  }

  // Check if auth is required but user isn't authenticated
  if (authRequired && !authService.isAuthenticated()) {
    next('/login')
    return
  }

  next()
}

export const assessmentGuard = (to, from, next) => {
  // Skip guard for these paths
  const bypassPaths = ['/', '/login', '/signup', '/assessment','/assessment/question']
  if (bypassPaths.includes(to.path)) {
    next()
    return
  }

  // Only check assessment for authenticated users
  if (authService.isAuthenticated()) {
    const hasCompletedAssessment = userStore.state.initial_assessment_completed.value

    console.log('Assessment Guard Check:', {
      path: to.path,
      hasCompletedAssessment,
      userData: {
        isAuthenticated: userStore.state.isAuthenticated.value,
        initial_assessment_completed: userStore.state.initial_assessment_completed.value
      }
    })

    if (!hasCompletedAssessment && to.path !== '/assessment') {
      next('/assessment')
      return
    }
  }

  next()
}