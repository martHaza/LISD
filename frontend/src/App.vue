<template>
  <div>
    <nav  v-if="authStore.token">
      <router-link to="/qrtest">Info pieprasījums (qrtest1)</router-link> |
      <router-link to="/qrtest2">Inventāra pārskate (qrtest2)</router-link> |
      <router-link to="/">Pieteikšanās inventāra lietošanai</router-link> |
      <router-link to="/">Pieteikt bojātu inventāru </router-link> |
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

export default {
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();

    const logoutAndRedirect = () => {
      authStore.logout();
      router.push("/login"); 
    };

  return { authStore, logoutAndRedirect };
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
