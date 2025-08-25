<script setup>
import { ref, onMounted, computed } from "vue";
import api from "../services/api";

const transferRequests = ref([]);
const transfers = ref([]);
const selectedRequest = ref(null);
const isModalOpen = ref(false);

const statuses = ["all", "pending", "approved", "denied"];
const selectedStatus = ref("pending");

const fetchTransferRequests = async () => {
  try {
    const res = await api.get("/transfer-requests");
    transferRequests.value = res.data;
  } catch (err) {
    console.error("Failed to fetch transfer requests:", err);
  }
};

const fetchTransfers = async (requestId) => {
  try {
    const res = await api.get(`/transfer-requests/${requestId}/transfers`);
    transfers.value = res.data;
  } catch (err) {
    console.error("Failed to fetch transfers:", err);
  }
};

const openRequestModal = (request) => {
  selectedRequest.value = request;
  isModalOpen.value = true;
  fetchTransfers(request.request_id);
};

const closeRequestModal = () => {
  selectedRequest.value = null;
  transfers.value = [];
  isModalOpen.value = false;
};

const approveRequest = async (requestId) => {
  try {
    await api.patch(`/transfer-requests/${requestId}`, { status: "approved" });
    const req = transferRequests.value.find(r => r.request_id === requestId);
    if (req) req.status = "approved";
    alert("Pārvietošanas pieprasījums apstiprināts!");
  } catch (err) {
    console.error("Failed to approve:", err);
  }
};

const rejectRequest = async (requestId) => {
  try {
    await api.patch(`/transfer-requests/${requestId}`, { status: "denied" });
    const req = transferRequests.value.find(r => r.request_id === requestId);
    if (req) req.status = "denied";
    alert("Pārvietošanas pieprasījums noraidīts!");
  } catch (err) {
    console.error("Failed to reject:", err);
  }
};

const filteredRequests = computed(() => {
  if (selectedStatus.value === "all") return transferRequests.value;
  return transferRequests.value.filter(r => r.status === selectedStatus.value);
});

// const generateReport = async (requestId) => {
//   try {
//     const res = await api.get(`/transfer-requests/${requestId}/report`, {
//       responseType: "blob"
//     });
//     const blob = new Blob([res.data], { type: "application/pdf" });
//     const url = window.URL.createObjectURL(blob);
//     const link = document.createElement("a");
//     link.href = url;
//     link.download = `transfer_request_${requestId}.pdf`;
//     link.click();
//   } catch (err) {
//     console.error("Failed to generate report:", err);
//   }
// };

onMounted(fetchTransferRequests);
</script>

<template>
  <div class="p-4">
    <h1 class="text-xl font-bold mb-4">Pārvietošanas pieprasījumi</h1>

    <div class="mb-4 flex items-center gap-2">
      <label>Filtrēt pēc statusa:</label>
      <select v-model="selectedStatus" class="border p-2">
        <option v-for="status in statuses" :key="status" :value="status">{{ status }}</option>
      </select>
    </div>

    <table class="w-full border-collapse border border-gray-300">
      <thead>
        <tr class="bg-gray-100">
          <th class="border p-2">ID</th>
          <th class="border p-2">Lietotājs</th>
          <th class="border p-2">Iemesls</th>
          <th class="border p-2">Veids</th>
          <th class="border p-2">Inventārs</th>
          <th class="border p-2">Statuss</th>
          <th class="border p-2">Darbība</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="req in filteredRequests" :key="req.request_id" class="border">
          <td class="border p-2">{{ req.request_id }}</td>
          <td class="border p-2">{{ req.user_id }}</td>
          <td class="border p-2">{{ req.reason }}</td>
          <td class="border p-2">{{ req.transfer_type }}</td>
          <td class="border p-2">
            <ul class="list-disc pl-4 m-0">
              <li v-for="tr in req.transfers" :key="tr.transfer_id">
                {{ tr.item_name || tr.item_id }}
              </li>
            </ul>
          </td>
          <td class="border p-2">{{ req.status }}</td>
          <td class="border p-2">
            <button
              class="bg-blue-500 text-white px-2 py-1 rounded"
              @click="openRequestModal(req)"
            >
              Apskatīt
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
    >
      <div class="bg-white p-6 rounded shadow w-1/2 max-h-[80vh] overflow-y-auto">
        <h2 class="text-xl font-bold mb-4">Pieprasījuma detaļas</h2>

        <p><b>ID:</b> {{ selectedRequest?.request_id }}</p>
        <p><b>Lietotājs:</b> {{ selectedRequest?.user_id }}</p>
        <p><b>Iemesls:</b> {{ selectedRequest?.reason }}</p>
        <p><b>Veids:</b> {{ selectedRequest?.transfer_type }}</p>
        <p><b>Statuss:</b> {{ selectedRequest?.status }}</p>

        <h3 class="mt-4 font-semibold">Pārvietojamais inventārs:</h3>
        <ul class="list-disc pl-5">
          <li v-for="tr in selectedRequest?.transfers" :key="tr.transfer_id">
            <strong>{{ tr.item_name || tr.item_id }}:</strong>
            <span v-if="tr.transfer_type === 'temporary'">
              no {{ new Date(tr.from_time).toLocaleString() }} līdz {{ new Date(tr.to_time).toLocaleString() }}
            </span>
            <span v-else>permanenti</span>
            <br>
            <em>{{ tr.from_location }} → {{ tr.to_location }}</em>
          </li>
        </ul>

        <div class="mt-4 flex justify-end gap-2">
          <button
            class="bg-gray-500 text-white px-4 py-2 rounded"
            @click="closeRequestModal"
          >
            Aizvērt
          </button>
          <button
            class="bg-green-500 text-white px-4 py-2 rounded"
            @click="approveRequest(selectedRequest)"
            v-if="selectedRequest?.status === 'pending'"
          >
            Apstiprināt
          </button>
          <button
            class="bg-red-500 text-white px-4 py-2 rounded"
            @click="rejectRequest(selectedRequest)"
            v-if="selectedRequest?.status === 'pending'"
          >
            Noraidīt
          </button>
        </div>
      </div>
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

.fixed,
.modal-container {
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
  background: #4caf50;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 0.25rem;
  transition: background 0.2s;
}

button:hover {
  background: #45a049;
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

.toggle-switch {
  appearance: none;
  width: 40px;
  height: 20px;
  background: #ccc;
  border-radius: 10px;
  position: relative;
  cursor: pointer;
  outline: none;
  transition: background 0.3s;
}

.toggle-switch:checked {
  background: #4caf50;
}

.toggle-switch::before {
  content: "";
  position: absolute;
  width: 18px;
  height: 18px;
  background: white;
  border-radius: 50%;
  top: 1px;
  left: 2px;
  transition: transform 0.3s;
}

.toggle-switch:checked::before {
  transform: translateX(20px);
}
</style>