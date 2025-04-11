<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { jwtDecode } from "jwt-decode";
import api from "../services/api";

const authStore = useAuthStore();
const router = useRouter();

const user = ref(null);
const phone_number = ref("");
const isSubmitting = ref(false);
const errorMessage = ref("");

const fetchUser = async () => {
  try {
    const userId = jwtDecode(authStore.token)?.user_id;
    if (!userId) throw new Error("User ID not found");
    const userResponse = await api.get(`/users/current`);
    user.value = userResponse.data;
  } catch (error) {
    console.error("Failed to fetch user:", error);
  }
};

onMounted(fetchUser);

const submitRegistration = async () => {
  isSubmitting.value = true;
  errorMessage.value = "";

  if (!user.value) {
    alert("Nevarēja iegūt lietotāja informāciju. Lūdzu, ielogojieties vēlreiz.");
    return;
  }
  try {
    await api.put(`/users/assign-phone-number`, {
      phone_number: phone_number.value,
    });
    await api.post(`/user_roles/assign-initial`);
    const rolesResponse = await api.get(`/user_roles/current`);
    authStore.roles = rolesResponse.data;
    await authStore.checkAuth();
    router.push("/");
  } catch (error) {
    errorMessage.value = "Neizdevās reģistrācija";
    console.error("Registration error:", error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="p-4">
    <h1 class="text-xl font-bold mb-4">Sveicināti, laboratoriju inventarizācijas sistēmā! </h1>
    <p class="mb-2">E-pasts: <strong>{{ user?.email }}</strong></p>
    <input v-model="phone_number" placeholder="Telefona Nr." class="border p-2 w-full mb-2" />
    <button @click="submitRegistration" :disabled="isSubmitting" class="bg-blue-500 text-white px-4 py-2 rounded">
      Sākt darbu
    </button>
    <p v-if="errorMessage" class="text-red-500 mt-2">{{ errorMessage }}</p>
  </div>
</template>
