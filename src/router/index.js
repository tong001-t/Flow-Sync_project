import { createRouter, createWebHistory } from 'vue-router'
import IndexView from '@/views/IndexView.vue'
import LoginView from '@/views/LoginView.vue'
import store from '@/store'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { noAuth: true }
  },
  {
    path: '/',
    name: 'index',
    component: IndexView,
    redirect: '/overview',
    meta: { requiresAuth: true },
    children: [
      { path: '/overview', name: 'overview', component: () => import('@/components/Overview.vue'), meta: { requiresAuth: true } },
      { path: '/pm', name: 'pm', component: () => import('@/components/PM.vue'), meta: { requiresAuth: true } },
      { path: '/taskbreak', name: 'taskbreak', component: () => import('@/components/Taskbreak.vue'), meta: { requiresAuth: true, requiresLeader: true } },
      { path: '/taskmanagement', name: 'taskmanagement', component: () => import('@/components/TaskManagement.vue'), meta: { requiresAuth: true } },
      { path: '/progresstracking', name: 'progresstracking', component: () => import('@/components/ProgressTracking.vue'), meta: { requiresAuth: true } },
      { path: '/summarycenter', name: 'summarycenter', component: () => import('@/components/SummaryCenter.vue'), meta: { requiresAuth: true } },
      { path: '/memberlist', name: 'memberlist', component: () => import('@/components/MemberList.vue'), meta: { requiresAuth: true } },
      { path: '/personalinfo', name: 'personalinfo', component: () => import('@/components/PersonalInfo.vue'), meta: { requiresAuth: true } }
    ]
  },
  { path: '/button', name: 'button', component: () => import('@/views/ButtonView.vue') }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to, _from, next) => {
  const isLoggedIn = store.getters.isLoggedIn
  const isLeader = store.getters.isLeader

  if (to.meta.requiresAuth && !isLoggedIn) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else if (to.meta.requiresLeader && !isLeader) {
    next({ path: '/overview' })
  } else if (to.name === 'login' && isLoggedIn) {
    next({ path: '/overview' })
  } else {
    next()
  }
})

export default router
