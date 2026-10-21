import { createRouter, createWebHistory } from 'vue-router'
import { navigationGuard } from './guards'

// meta.public:  reachable without signing in (signed-in users are sent to the dashboard)
// meta.title:   document title
const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { public: true, title: 'Unleash your creativity' },
  },
  {
    path: '/signup',
    name: 'signup',
    component: () => import('@/views/SignupView.vue'),
    meta: { public: true, title: 'Create an account' },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { public: true, title: 'Log in' },
  },
  {
    path: '/assessment',
    name: 'assessment',
    component: () => import('@/views/AssessmentIntro.vue'),
    meta: { title: 'Welcome quiz', assessment: true },
  },
  {
    path: '/assessment/question',
    name: 'assessment-question',
    component: () => import('@/views/AssessmentQuestion.vue'),
    meta: { title: 'Welcome quiz', assessment: true },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { title: 'Home' },
  },
  {
    path: '/create-story',
    name: 'create-story',
    component: () => import('@/views/CreateStory.vue'),
    meta: { title: 'Write a story' },
  },
  {
    path: '/comics',
    name: 'comics',
    component: () => import('@/views/ComicsView.vue'),
    meta: { title: 'My comics' },
  },
  {
    path: '/writing-tips',
    name: 'writing-tips',
    component: () => import('@/views/WritingTips.vue'),
    meta: { title: 'Writing tips' },
  },
  {
    path: '/writing-tips/:id',
    name: 'writing-tip-view',
    component: () => import('@/views/WritingTipView.vue'),
    meta: { title: 'Writing tips' },
  },
  {
    path: '/progress',
    name: 'progress',
    component: () => import('@/views/ProgressView.vue'),
    meta: { title: 'My progress' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { public: true, allowSignedIn: true, title: 'Page not found' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: (to, from, saved) => saved || { top: 0 },
})

router.beforeEach(navigationGuard)

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · Inkwell` : 'Inkwell'
})

export default router
