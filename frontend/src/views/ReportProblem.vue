<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "../store/auth";
import { jwtDecode } from "jwt-decode";
import api from "../services/api";

const authStore = useAuthStore();
const items = ref([]);
const selectedItems = ref([]);
const title = ref("");
const description = ref("");

const fetchItems = async () => {
    try {
        const response = await api.get(`/items`);
        items.value = response.data;
    } catch (error) {
        console.error("Error fetching items", error);
    }
};

const toggleItemSelection = (itemId) => {
    const index = selectedItems.value.indexOf(itemId);
    if (index === -1) {
        selectedItems.value.push(itemId);
    } else {
        selectedItems.value.splice(index, 1);
    }
};

const submitDamageReport = async () => {
    if (!title.value || !description.value || selectedItems.value.length === 0) {
        alert("Lūdzu aizpildiet visus laukus un izvēlieties vismaz vienu inventāra vienību.");
        return;
    }
    const userId = jwtDecode(authStore.token)?.user_id;
        if (!userId) {
            alert("Nevarēja iegūt lietotāja ID. Lūdzu, ielogojieties vēlreiz!");
            return;
        }

    try {
        await api.post(`/damaged-item`, {
            user_id: userId,
            title: title.value,
            description: description.value,
            status: "new",
            inventory_ids: selectedItems.value,
        });

        alert("Bojājums veiksmīgi pieteikts!");
        selectedItems.value = [];
        title.value = "";
        description.value = "";
    } catch (error) {
        console.error("Neizdevās pieteikt bojājumu:", error);
        alert("Radās kļūda pieteikuma saglabāšanā!");
    }
}

onMounted(fetchItems);
</script>

<template>
    <div class="request-container">
    <h1>Pieteikt bojātu inventāru</h1>

    <label>Izvēlieties inventāra vienības:</label>

    <div class="items-list">
        <div v-for="item in items" :key="items.item_id" class="item" :class="{ selected: selectedItems.includes(items.item_id) }"
            @click="toggleItemSelection(items.item_id)">
            {{ items.item_title }}
        </div>
    </div>

    <label>Bojājuma nosaukums:</label>

    <input type="text" v-model="title" placeholder="Bojājuma nosaukums" required/>

    <label>Apraksts:</label>

    <textarea v-model="description" placeholder="Detalizēts bojājuma apraksts" required></textarea>

    <button @click="submitDamageReport">Pieteikt bojājumu</button>
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

.items-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
  margin: 12px 0;
}

.item {
  padding: 12px;
  border: 2px solid #ccc;
  border-radius: 8px;
  background: #f9f9f9;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  user-select: none;
}

.item:hover {
  background-color: #e0e0e0;
}

.item.selected {
  background-color: #4caf50;
  color: white;
  border-color: #388e3c;
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
</style>

