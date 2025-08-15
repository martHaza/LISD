<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "../stores/auth";
import { jwtDecode } from "jwt-decode";
import api from "../services/api";

const authStore = useAuthStore();
const itemNumber = ref("");    
const itemDetails = ref(null);  
const title = ref("");
const description = ref("");

const fetchItemByNumber = async () => {
  if (!itemNumber.value) return;

  try {
    const response = await api.get(`/items/item_number/${itemNumber.value}`);
    itemDetails.value = response.data.item;
  } catch (error) {
    console.error("Failed to fetch item:", error);
    itemDetails.value = null;
  }
};

const submitDamageReport = async () => {
  if (!itemDetails.value) {
    alert("Izvēlaties inventāru.");
    return;
  }
  if (!title.value || !description.value) {
    alert("Lūdzu aizpildiet visus laukus.");
    return;
  }

  const userId = jwtDecode(authStore.token)?.user_id;
  if (!userId) {
    alert("Nevarēja iegūt lietotāja ID. Lūdzu, ielogojieties vēlreiz!");
    return;
  }

  try {
    await api.post(`/issues`, {
      item_id: itemDetails.value.id,
      reported_by: userId,
      title: title.value,
      description: description.value,
      status: "open"
    });

    alert("Problēma veiksmīgi pieteikta!");
    itemNumber.value = "";
    itemDetails.value = null;
    title.value = "";
    description.value = "";
  } catch (error) {
    console.error("Error submitting problem:", error);
    alert("Neizdevās pieteikt bojājumu!");
  }
};

onMounted(fetchItemByNumber);
</script>

<template>
    <div class="request-container">
    <h1>Pieteikt bojātu inventāru</h1>

    <label>Ievadiet inventāra numuru:</label>
     <input type="text" v-model="itemNumber" placeholder="Inventāra numurs" @blur="fetchItemByNumber" required/>

     <div v-if="itemDetails" class="item-details">
      <h3>{{ itemDetails.title }} ({{ itemDetails.number }})</h3>
      <p>Kods: {{ itemDetails.code }}</p>
      <p>Apraksts: {{ itemDetails.description }}</p>
     </div>

    <label>Bojājuma nosaukums:</label>
    <input type="text" v-model="title" placeholder="Bojājuma nosaukums" required/>

    <label>Apraksts:</label>
    <textarea v-model="description" placeholder="Detalizēts bojājuma apraksts" required></textarea>

    <button @click="submitDamageReport" :disabled="!itemDetails">Pieteikt bojājumu</button>
  </div>
</template>

<style scoped>

.request-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 10px;
  background: #f9f9f9;
  display: flex;
  flex-direction: column;
}

h1 {
  margin-bottom: 20px;
  font-size: 24px;
  color: #333;
}

label {
  display: block;
  margin-top: 16px;
  font-weight: 600;
  color: #333;
}

input,
textarea {
  width: 100%;
  padding: 10px;
  margin-top: 6px;
  margin-bottom: 16px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
}

textarea {
  min-height: 100px;
  resize: vertical;
}

button {
  background: #4caf50;
  color: white;
  border: none;
  padding: 10px 16px;
  font-size: 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  margin-top: 12px;
}

button:hover {
  background: #388e3c;
}

.item-details {
  border: 1px solid #ccc;
  padding: 10px;
  margin-top: 10px;
  background-color: #f9f9f9;
  border-radius: 6px;
}
</style>

