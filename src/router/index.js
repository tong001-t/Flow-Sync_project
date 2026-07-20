import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ButtonView from '@/views/ButtonView.vue'
import IndexView from '@/views/IndexView.vue'
import Overview from '@/components/Overview.vue'
import PM from '@/components/PM.vue'
import TaskM from '@/components/TaskM.vue'
const routes = [
  {
    path: '/',
    name: 'index',
    component: IndexView,
    children: [
      {
        path: '/overview',
        component: () => import('@/components/Overview.vue')
      },
      {
        path: '/pm',
        component: () => import('@/components/PM.vue')
      },
      {
        path:'/taskbreak',
        component:()=>import ('@/components/Taskbreak.vue')
      },
      {
        path:'/taskm',
        component:() => import('@/components/TaskM.vue')
      }
    ]
  },
  {
    path:'/overview',
    name:'overview',
    component:Overview
  },
  {
    path: '/home',
    name: 'home',
    component: HomeView
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  },
  {
    path:'/button',
    name:'button',
    component:ButtonView
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
