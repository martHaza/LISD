import { createRouter, createWebHistory } from "vue-router";
import Login from "./views/Login.vue";
import Home from "./views/Home.vue";
import Register from "./views/Register.vue";
import QRTest from "./views/QRTest.vue";
import ImageUpload from "./views/ImageUpload.vue";
import Gallery from "./views/Gallery.vue";
import UserOverview from "./views/UserOverview.vue";
import { useAuthStore } from "./stores/auth";
import InventoryOverview from "./views/InventoryOverview.vue";
import ReportProblem from "./views/ReportProblem.vue";

const routes = [
    { path: "/", component: Home, meta: { requiresAuth: true }},
    { path: "/login", component: Login },
    { path: "/register", component: Register , meta: { requiresAuth: true }},
    { path: "/qrtest", component: QRTest , meta: { requiresAuth: true }},
    { path: "/image-upload", component: ImageUpload , meta: { requiresAuth: true }},
    { path: "/gallery", component: Gallery , meta: { requiresAuth: true }},
    { path: "/user_overview", component: UserOverview, meta: { requiresAuth: true }},
    { path: "/inventory_overview", component: InventoryOverview, meta: { requiresAuth: true }},
    { path: "/report_problem", component: ReportProblem, meta: { requiresAuth: true }}
];

const router = createRouter({
    history: createWebHistory("/lisd/"),
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