import { userStore } from '@/stores/userStore'
import { authService } from '@/services/authService'

/**
 * - Signed-out users can only see public pages; others go to login and come back afterwards.
 * - Signed-in users skip the public landing/auth pages.
 * - Signed-in users must finish the welcome quiz before using the rest of the app.
 *   The quiz stays reachable afterwards:
 */
export const navigationGuard = (to) => {
  const signedIn = authService.isAuthenticated()

  if (!signedIn) {
    if (to.meta.public) return true
    return { name: 'login', query: to.fullPath !== '/dashboard' ? { redirect: to.fullPath } : {} }
  }

  if (to.meta.public && !to.meta.allowSignedIn) return { name: 'dashboard' }

  const quizDone = userStore.state.initial_assessment_completed.value
  if (!quizDone && !to.meta.assessment && !to.meta.public) return { name: 'assessment' }

  return true
}
