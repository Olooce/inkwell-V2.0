import { createRouter, createWebHistory } from 'vue-router'
import { authGuard,assessmentGuard } from './guards'
import { userStore } from '@/stores/userStore' // Import at the top


const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('@/views/HomeView.vue'),
        meta: { requiresAuth: false }
    },
    {
        path: '/signup',
        name: 'Signup',
        component: () => import('@/views/SignupView.vue'),
        meta: { requiresAuth: false }
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/LoginView.vue'),
        meta: { requiresAuth: false }
    },

    {
        path: '/assessment',
        name: 'assessment',
        component: () => import('@/views/AssessmentIntro.vue'),
        meta: { requiresAuth: true }
      },
  {
    path: '/assessment/question',
    name: 'assessment-question',
    component: () => import('@/views/AssessmentQuestion.vue'),
    meta: { requiresAuth: true }
  },
      {
        path: '/dashboard',
        name: 'dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: '/create-story',
        name: 'create-story',
        component: () => import('@/views/CreateStory.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: '/story-picture',
        name: 'story-picture',
        component: () => import('@/views/StoryPicture.vue'),
        meta: { requiresAuth: true },
        beforeEnter: (to, from, next) => {
          // Only allow access from create-story
          if (from.name === 'create-story') {
            next()
          } else {
            next('/create-story')
          }
        }
      },
      {
        path: '/comics',
        name: 'comics',
        component: () => import('@/views/Comics.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: '/comics/:id',
        name: 'comic-detail',
        component: () => import('@/views/ComicDetail.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: '/writing-tips',
        name: 'writing-tips',
        component: () => import('@/views/WritingTips.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: '/progress',
        name: 'progress',
        component: () => import('@/views/Progress.vue'),
        meta: { requiresAuth: true }
      }
]



const router = createRouter({
    history: createWebHistory(),
    routes
  })

  // Initialize user store from localStorage
  userStore.loadStoredUser()

  // Apply guards synchronously
  router.beforeEach(authGuard)
  router.beforeEach(assessmentGuard)


  export default router
