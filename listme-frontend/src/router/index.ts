import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ListDetailView from '../views/ListDetailView.vue'
import JoinListView from '../views/JoinListView.vue'
import SyncApplyView from '../views/SyncApplyView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/list/:id',
      name: 'list-detail',
      component: ListDetailView,
    },
    {
      path: '/s/:token',
      name: 'join-list',
      component: JoinListView,
    },
    {
      path: '/sync/:token',
      name: 'sync-apply',
      component: SyncApplyView,
    },
  ],
})

export default router
