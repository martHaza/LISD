<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "../store/auth";
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
      api.get("/items"),
      api.get("/locations")
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

        const item = items.value.find(i => i.id === selectedItem.value);
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
    <h1 class="text-xl font-bold mb-4">Inventāra pārvietošanas pieprasījumi</h1>

    <div class="mb-4 flex items-center gap-2">
      <label for="transferType" class="font-semibold">Pārvietošanas veids:</label>
      <select id="transferType" v-model="transferType" class="border p-2">
        <option value="temporary">Pagaidu</option>
        <option value="permanent">Pastāvīga</option>
      </select>
    </div>

    <div class="mb-4 flex flex-col gap-2">
      <label class="font-semibold">Izvēlies inventāra vienību:</label>
      <select v-model="selectedItem" class="border p-2">
        <option value="" disabled>Izvēlies vienību...</option>
        <option v-for="item in items" :key="item.id" :value="item.id">
          {{ item.title }} (Faktiskā atrašanās vieta: {{ item.factual_location_name }})
        </option>
      </select>
    </div>

    <div class="mb-4 flex flex-col gap-2">
      <label class="font-semibold">Galamērķa atrašanās vieta:</label>
      <select v-model="destinationLocation" class="border p-2">
        <option value="" disabled>Izvēlies atrašanās vietu...</option>
        <option v-for="loc in availableLocations" :key="loc.id" :value="loc.id">
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

