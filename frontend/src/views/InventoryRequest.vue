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
