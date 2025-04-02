import { createRouter, createWebHistory } from "vue-router";
import Login from "./views/Login.vue";
import Home from "./views/Home.vue";
import { useAuthStore } from "./stores/auth";

const routes = [
    { path: "/", component: Home, meta: { requiresAuth: true }},
    { path: "/login", component: Login },
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();
    if (authStore.token && !authStore.user) {
      await authStore.checkAuth();
    }
    if (to.meta.requiresAuth && !authStore.user) {
      next('/login');
    } else {
      next();
    }
});
export default router;