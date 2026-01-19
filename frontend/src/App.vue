<template>
  <div>
    <nav  v-if="authStore.token">
      <router-link to="/">Sākums</router-link> | 
      <router-link to="/qrtest">Skenēšana</router-link> |
      <router-link to="/image-upload">Attēla augšupielāde</router-link> |
      <router-link to="/gallery">Galerija</router-link> |
      <router-link v-if="authStore.currentRole=='administrators'" to="/user_overview">Lietotāju pārvaldība </router-link> |
      <router-link v-if="canReportProblem" to="/report_problem">Pieteikt bojātu inventāru</router-link> |
      <router-link to="/inventory_overview">Inventāra pārvaldība</router-link> |
      <router-link to="/transfer_request">Inventāra pārvietošanas pieprasījums</router-link> |
      <router-link to="/inventory_request">Inventāra izsniegšanas pieprasījums</router-link> |
      <router-link to="/inventory_request_overview">Inventāra izsniegšanas pārskats</router-link> |
      <router-link to="/transfer_request_overview">Inventāra pārvietošanas pārskats</router-link> |     
      <button v-if="deferredPrompt" @click="installPWA">Instalēt PWA</button>
      <button v-if="authStore.token" @click="logoutAndRedirect">Logout</button>
      <select v-if="authStore.roles && authStore.roles.length > 1" v-model="authStore.currentRole">
      <option v-for="role in authStore.roles" :key="role" :value="role">{{ role }}</option>
      </select>
    </nav>
    <router-view />
  </div>
</template>

<script>
import { useAuthStore } from "./stores/auth";
import { useRouter } from "vue-router"; 
import { computed } from "vue";

export default {
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();

    const logoutAndRedirect = () => {
      authStore.logout();
      router.push("/login"); 
    };

    const canReportProblem = computed(() => {
      const allowedRoles = ["lietotājs", "laborants", "materiāli atbildīgā persona"];
      return authStore.currentRole && allowedRoles.includes(authStore.currentRole);
    });

  return { authStore, logoutAndRedirect, canReportProblem };
  },
  data() {
    return { deferredPrompt: null };
  },
  mounted() {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
    });
  },
  methods: {
    installPWA() {
      if (this.deferredPrompt) {
        this.deferredPrompt.prompt();
        this.deferredPrompt.userChoice.then((choice) => {
          if (choice.outcome === "accepted") console.log("User installed PWA");
          this.deferredPrompt = null;
        });
      }
    },
  },
};
</script>
