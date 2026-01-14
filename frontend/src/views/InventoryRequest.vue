<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "../stores/auth";
import { jwtDecode } from "jwt-decode";
import api from "../services/api";

const authStore = useAuthStore();
const items = ref([]);
const selectedItems = ref([]);
const requestInfo = ref("");
const timeSlots = ref([{ fromTime: "", toTime: "" }]);

const fetchItems = async () => {
    try {
        const response = await api.get(`/items/transfer-list`);
        items.value = response.data.items;
    } catch (error) {
        console.error("Failed to fetch items:", error);
    }
};

const toggleItemSelection = (itemId) => {
    const index = selectedItems.value.indexOf(itemId);
    if (index === -1) selectedItems.value.push(itemId);
    else selectedItems.value.splice(index, 1);
};

const addTimeSlot = () => {
    timeSlots.value.push({ fromTime: "", toTime: "" });
};

const removeTimeSlot = (index) => {
    if (timeSlots.value.length > 1) { 
        timeSlots.value.splice(index, 1);
    }
};

const submitRequest = async () => {
    if (selectedItems.value.length === 0 || timeSlots.value.some(slot => !slot.fromTime || !slot.toTime)) {
        alert("Lūdzu izvēlieties vismaz vienu inventāra vienību un laikus.");
        return;
    }

    const userId = jwtDecode(authStore.token)?.user_id;
    if (!userId) {
        alert("Nevarēja iegūt lietotāja ID. Lūdzu, ielogojieties vēlreiz.");
        return;
    }

    try {
        const requestResponse = await api.post(`/item-requests`, {
            user_id: userId,
            information: requestInfo.value,
            status: "pending"
        });

        const requestId = requestResponse.data.item_request_id;

        for (const itemId of selectedItems.value) {
            for (const { fromTime, toTime } of timeSlots.value) {
                await api.post(`/item-reservations`, {
                    item_id: itemId,
                    request_id: requestId,
                    from_time: fromTime,
                    to_time: toTime
                });
            }
        }

        alert("Pieprasījums veiksmīgi iesniegts!");
        selectedItems.value = [];
        requestInfo.value = "";
        timeSlots.value = [{ fromTime: "", toTime: "" }];
    } catch (error) {
        console.error("Failed to submit request:", error);
        alert("Neizdevās iesniegt pieprasījumu.");
    }
};

onMounted(fetchItems);
</script>

<template>
  <div class="p-4">
    <h1 class="text-xl font-bold mb-4">Inventāra izsniegšanas pieprasījums</h1>

    <div class="mb-4 flex flex-col gap-2">
      <label class="font-semibold">Izvēlieties inventāru:</label>
      <select v-model="selectedItem" class="border p-2 select-field-item">
      <option value="" disabled>Izvēlies vienību...</option>
        <option v-for="item in items" :key="item.item_id" :value="item.item_id">
          {{ item.title }} (Faktiskā atrašanās vieta: {{ item.factual_location_room }})
        </option>
        </select>
      </div>
    </div>

    <div class="mb-4">
      <label class="font-semibold block mb-1">Komentārs:</label>
      <textarea v-model="requestInfo" rows="3" class="border p-2 w-full" placeholder="Papildu informācija"></textarea>
    </div>

    <div class="mb-4">
      <h2 class="font-semibold mb-2">Laika posmi</h2>
      <div v-for="(slot, index) in timeSlots" :key="index" class="flex gap-2 mb-2 items-center">
        <input type="datetime-local" v-model="slot.fromTime" class="border p-2 w-1/2" />
        <input type="datetime-local" v-model="slot.toTime" class="border p-2 w-1/2" />
        <button @click="removeTimeSlot(index)" class="bg-red-500 text-white px-2 py-1 rounded">Dzēst</button>
      </div>
      <button @click="addTimeSlot" class="bg-green-500 text-white px-3 py-1 rounded">Pievienot laika posmu</button>
    </div>

    <div class="flex justify-end mt-4">
      <button @click="submitRequest" class="bg-blue-500 text-white px-4 py-2 rounded">
        Iesniegt pieprasījumu
      </button>
    </div>
</template>

<style scoped>
html,
body {
  overflow: visible !important;
}

.select-field-item {
  width: 600px; 
  max-width: 100%;
  min-height: 20px;
}

.request-container {
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 8px;
}

h1 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #333;
}

label {
  display: block;
  font-weight: 600;
  margin: 0.75rem 0 0.25rem;
}

.inventory-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.inventory-item {
  border: 1px solid #ddd;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  background-color: #f4f4f4;
  transition: background-color 0.2s ease-in-out, transform 0.1s ease-in-out;
}

.inventory-item:hover {
  background-color: #e0e0e0;
  transform: scale(1.02);
}

.inventory-item.selected {
  background-color: #3b82f6;
  color: white;
  font-weight: bold;
}

.time-slots {
  margin-top: 1rem;
}

.time-slot {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.5rem;
}

input[type="datetime-local"] {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

textarea {
  width: 100%;
  margin-top: 0.5rem;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: vertical;
}

button {
  border: none;
  cursor: pointer;
  border-radius: 4px;
  padding: 6px 12px;
  color: white;
  font-weight: 500;
  transition: background-color 0.2s ease-in-out, transform 0.1s ease-in-out;
}

button:hover {
  transform: translateY(-1px);
}

button.bg-blue-500 {
  background: #3b82f6;
}

button.bg-green-500 {
  background: #4caf50;
}

button.bg-red-500 {
  background: #ef4444;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>