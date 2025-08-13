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

