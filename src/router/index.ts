// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/HomeView.vue'
import ProductDetails from '../views/ProductDetails.vue'
// import ProductForm from '../components/ProductForm.vue';
import Dashboard from '../views/DashboardView.vue'
import SignUp from '@/views/SignUp.vue'
import Login from '../views/Login.vue'
import { auth, db } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
  },
  {
    path: '/product/:id',
    name: 'product-details',
    component: ProductDetails,
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: Dashboard,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/signup',
    name: 'signup',
    component: SignUp,
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})
// Navigation guard to check authentication and role
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const requiresAdmin = to.matched.some((record) => record.meta.requiresAdmin)

  // Wait for the authentication state to resolve
  const user = await new Promise<import('firebase/auth').User | null>((resolve) => {
    onAuthStateChanged(
      auth,
      (user) => resolve(user),
      () => resolve(null),
    )
  })

  if (requiresAuth && !user) {
    // If the route requires authentication and the user is not logged in, redirect to login
    next({ name: 'login' })
    return
  }

  if (requiresAdmin && user) {
    // If the route requires admin role, fetch the user's role from Firestore
    try {
      const userDocRef = doc(db, 'users', user.uid)
      const userDoc = await getDoc(userDocRef)
      if (userDoc.exists()) {
        const role = userDoc.data().role
        if (role === 'admin') {
          // User is an admin, allow access
          next()
        } else {
          // User is not an admin, redirect to home
          next({ name: 'home' })
        }
      } else {
        // User document doesn't exist, redirect to home
        next({ name: 'home' })
      }
    } catch (error) {
      console.error('Error fetching user role:', error)
      next({ name: 'home' })
    }
  } else {
    // No special requirements, allow navigation
    next()
  }
})
export default router
