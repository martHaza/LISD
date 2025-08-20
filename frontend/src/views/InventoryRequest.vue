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

const fetchInventoryItems = async () => {
    try {
        const response = await api.get(`/items`);
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
        const requestResponse = await api.post(`/requests`, {
            user_id: userId,
            information: requestInfo.value,
            status: "pending"
        });

        const requestId = requestResponse.data.request_id;

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

onMounted(fetchInventoryItems);
</script>

<template>
  <div class="p-4">
    <h1 class="text-xl font-bold mb-4">Inventāra pieprasījumi</h1>

    <div class="mb-4 flex flex-col gap-2">
      <label class="font-semibold">Izvēlieties inventāra vienību:</label>
      <div class="inventory-list">
        <div 
          v-for="item in items" 
          :key="item.item_id"
          class="inventory-item border p-2 mb-2 cursor-pointer"
          :class="{ selected: selectedItems.includes(item.item_id) }"
          @click="toggleItemSelection(item.item_id)"
        >
          {{ item.title }} (Faktiskā atrašanās vieta: {{ item.factual_location_room }})
        </div>
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
  </div>
</template>