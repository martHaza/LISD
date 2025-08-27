<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "../stores/auth";
import { jwtDecode } from "jwt-decode";
import api from "../services/api";

const authStore = useAuthStore();
const items = ref([]);
const selectedItem = ref(null);
const transferType = ref("temporary"); // temporary or permanent
const destinationLocation = ref("");
const requestInfo = ref("");
const timeSlots = ref([{ fromTime: "", toTime: "" }]);
const availableLocations = ref([]);

const fetchItems = async () => {
  try {
    const [itemsRes, locationsRes] = await Promise.all([
      api.get("/items/list"),
      api.get("/locations/list")
    ]);
    items.value = itemsRes.data.items;
    availableLocations.value = locationsRes.data.locations;
  } catch (error) {
    console.error("Failed to fetch data:", error);
  }
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
    if (!selectedItem.value) {
        alert("Lūdzu izvēlieties inventāra vienību.");
        return;
    }

    if (!destinationLocation.value) {
        alert("Lūdzu izvēlieties galamērķa atrašanās vietu.");
        return;
    }
    
    if (
        transferType.value === "temporary" &&
        timeSlots.value.some(slot => !slot.fromTime || !slot.toTime)
    ) {
        alert("Lūdzu izvēlieties laikus pagaidu pārvietošanai.");
        return;
    }

        const userId = jwtDecode(authStore.token)?.user_id;
        if (!userId) {
            alert("Nevarēja iegūt lietotāja ID. Lūdzu, ielogojieties vēlreiz.");
            return;
        }

        try {
        const requestResponse = await api.post("/requests", {
        user_id: userId,
        information: requestInfo.value,
        transfer_type: transferType.value,
        status: "pending"
    });

        const requestId = requestResponse.data.request_id;

        const item = items.value.find(i => i.item_id === selectedItem.value);
        const fromLocation = item.factual_location_id;
        const toLocation = destinationLocation.value;

        if (transferType.value === "temporary") {

        for (const { fromTime, toTime } of timeSlots.value) {
            await api.post("/transfers", {
            item_id: selectedItem.value,
            request_id: requestId,
            transfer_type: "temporary",
            from_location: fromLocation,
            to_location: toLocation,
            reason: requestInfo.value,
            from_time: fromTime,
            to_time: toTime
        });
    }

    } else {
        await api.post("/transfers", {
            item_id: selectedItem.value,
            request_id: requestId,
            transfer_type: "permanent",
            from_location: fromLocation,
            to_location: toLocation,
            reason: requestInfo.value
        });
    }

        alert("Pieprasījums veiksmīgi iesniegts!");
        selectedItem.value = null;
        destinationLocation.value = "";
        requestInfo.value = "";
        transferType.value = "temporary";
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
    <h1 class="text-xl font-bold mb-4">Inventāra pārvietošanas pieprasījums</h1>

    <div class="mb-4 flex items-center gap-2">
      <label for="transferType" class="font-semibold">Pārvietošanas veids:</label>
      <select id="transferType" v-model="transferType" class="border p-2">
        <option value="temporary">Pagaidu</option>
        <option value="permanent">Pastāvīga</option>
      </select>
    </div>

    <div class="mb-4 flex flex-col gap-2">
      <label class="font-semibold">Izvēlieties inventāru:</label>
      <select v-model="selectedItem" class="border p-2">
        <option value="" disabled>Izvēlies vienību...</option>
        <option v-for="item in items" :key="item.item_id" :value="item.item_id">
          {{ item.title }} (Faktiskā atrašanās vieta: {{ item.factual_location_room }})
        </option>
      </select>
    </div>

    <div class="mb-4 flex flex-col gap-2">
      <label class="font-semibold">Galamērķa atrašanās vieta:</label>
      <select v-model="destinationLocation" class="border p-2">
        <option value="" disabled>Izvēlies atrašanās vietu...</option>
        <option v-for="loc in availableLocations" :key="loc.location_id" :value="loc.location_id">
          {{ loc.name }}
        </option>
      </select>
    </div>

    <div class="mb-4">
      <label class="font-semibold block mb-1">Iemesls pārvietošanai:</label>
      <textarea v-model="requestInfo" rows="3" class="border p-2 w-full"></textarea>
    </div>

    <div v-if="transferType === 'temporary'" class="mb-4">
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

<style scoped>
html,
body {
  overflow: visible !important;
}

.bg-gray-200 {
  background-color: #e0e0e0;
}

.request-container {
  padding: 1rem;
}

.filter-container {
  margin-bottom: 1rem;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #f4f4f4;
}

tr:hover {
  background-color: #f0f0f0;
  transition: background-color 0.2s ease-in-out;
}

button {
  border: none;
  cursor: pointer;
  border-radius: 4px;
  padding: 5px 10px;
  color: white;
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

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
}

.modal-content {
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.2);
  width: 500px;
  max-height: 80vh;
  overflow-y: auto;
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

textarea {
  width: 100%;
  margin-top: 0.5rem;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: vertical;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}
</style>
