import { createRouter, createWebHistory } from "vue-router";
import Login from "./views/Login.vue";
import Home from "./views/Home.vue";
import Register from "./views/Register.vue";
import QRTest from "./views/QRTest.vue";
import QRTest2 from "./views/QRTest2.vue";
import { useAuthStore } from "./stores/auth";

const routes = [
    { path: "/", component: Home, meta: { requiresAuth: true }},
    { path: "/login", component: Login },
    { path: "/register", component: Register },
    { path: "/qrtest", component: QRTest },
    { path: "/qrtest2", component: QRTest2 },
    
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();
    if (authStore.token && (!authStore.roles || authStore.roles.length === 0)) {
      await authStore.checkAuth();
    }
    if (to.meta.requiresAuth && !authStore.token) {
      next('/login');
    }
    else if (authStore.token && (!authStore.roles || authStore.roles.length === 0) && to.path !== "/register") { // to.path to prevent infinite loop
      next("/register");
    }
    else {
      next();
    }
});
export default router;