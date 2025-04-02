<template>
  <div>
    <nav  v-if="authStore.user">
      <router-link to="/">Datoru pārskats </router-link> |
      <router-link to="/">Apskatīt resursu aizņemtības pārskatu </router-link> |
      <router-link to="/">Pieteikšanās resursu lietošanai </router-link> |
      <router-link to="/">Rezervāciju veidošana </router-link> |
      <button v-if="deferredPrompt" @click="installPWA">Instalēt PWA</button>
      <button v-if="authStore.user" @click="logoutAndRedirect">Logout</button>
      <select v-if="authStore.roles.length > 1" v-model="authStore.currentRole">
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

<!-- <script setup>
import HelloWorld from './components/HelloWorld.vue'


</script>

<template>
  <div>
    <a href="https://vite.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  <HelloWorld msg="Vite + Vue" />
  <button v-if="deferredPrompt" @click="installPWA">Install App</button>
</template>

<script>
export default {
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

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style> -->
