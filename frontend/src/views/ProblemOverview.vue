<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "../stores/auth";
import { jwtDecode } from "jwt-decode";
import api from "../services/api";

const authStore = useAuthStore();
const issues = ref([]);
const statuses = ["pending", "solved", "unsolved"];
const selectedStatus = ref("pending");
const filteredIssues = ref([]);
const isModalOpen = ref(false);
const selectedIssue = ref(null);
const comments = ref([]);
const newComment = ref("");

const userRole = jwtDecode(authStore.token)?.role;

const fetchIssues = async () => {
    try {
        const ressponse = await api.get("/issues");
        issues.value = response.data.issues;
        filterIssues();
    } catch (error) {
        console.error("Failed to fetch issues:", error);
    }
};

const fetchComments = async () => {
    if (!selectedIssue.value) return;
    try {
        const response = await api.get(`/issues/${selectedIssue.value.issue_id}/comments`);
        comments.value = response.data.comments;
    } catch (error) {
        console.error("Failed to load comments:", error);
    }
};

const submitComment = async () => {
    if (!newComment.value.trim()) return;
    if (!["laborants", "materiāli atbildīgā persona"].includes(userRole)) {
        alert("Jums nav tiesību pievienot komentārus.");
        return;
    }
    const userId = jwtDecode(authStore.token)?.user_id;
    try {
        await api.post(`/issues/${selectedIssue.value.issue_id}/comments`, {
            user_id: userId,
            comment: newComment.value.trim()
        });
        newComment.value = "";
        await fetchComments();
    } catch (error) {
        console.error("Failed to add comment:", error);
        alert("Neizdevās pievienot komentāru.");
    }
};

const filterIssues = () => {
    if (selectedStatus.value === "all") {
        filteredIssues.value = issues.value;
    } else {
        filteredIssues.value = issues.value.filter(issue => issue.status === selectedStatus.value);
    }
};

const openModal = async (issue) => {
    try {
        const response = await api.get(`/issues/${issue.issue_id}`);
        selectedIssue.value = response.data.issue;
        await fetchComments();
        isModalOpen.value = true;
    } catch (error) {
        console.error("Failed to load issue:", error);
        alert("Neizdevās ielādēt problēmas datus.");
    }
};

const closeModal = () => {
    isModalOpen.value = false;
    selectedIssue.value = null;
};

const updateIssueStatus = async () => {
    if (!selectedIssue.value) return;
    try {
        await api.put(`/issues/${selectedIssue.value.issue_id}/status`, {
            status: selectedIssue.value.status
        });
        const index = issues.value.findIndex(i => i.issue_id === selectedIssue.value.issue_id);
        if (index !== -1) {
            issues.value[index].status = selectedIssue.value.status;
        }
        alert("Statuss atjaunināts!");
        closeModal();
    } catch (error) {
        console.error("Failed to update status:", error);
        alert("Neizdevās atjaunināt statusu.");
    }
};

onMounted(fetchIssues);
</script>

<template>
  <div class="p-4">
    <h1 class="text-xl font-bold mb-4">Problēmu pārskats</h1>

    <div class="mb-4 flex items-center gap-2">
      <label for="statusFilter" class="font-semibold">Filtrēt pēc statusa:</label>
      <select id="statusFilter" v-model="selectedStatus" @change="filterIssues" class="border p-2">
        <option value="all">Visi</option>
        <option v-for="status in statuses" :key="status" :value="status">
          {{ status }}
        </option>
      </select>
    </div>

    <p>Neapstiprinātu problēmu skaits: {{ pendingIssuesCount }}</p>

    <table class="w-full border-collapse border border-gray-300 mt-2">
      <thead>
        <tr class="bg-gray-100">
          <th class="border p-2">E-pasts</th>
          <th class="border p-2">Nosaukums</th>
          <th class="border p-2">Izveidots</th>
          <th class="border p-2">Statuss</th>
          <th class="border p-2">Darbība</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="issue in filteredIssues" :key="issue.issue_id" class="border">
          <td class="border p-2">{{ issue.email }}</td>
          <td class="border p-2">{{ issue.title }}</td>
          <td class="border p-2">{{ new Date(issue.created_at).toLocaleString() }}</td>
          <td class="border p-2">{{ issue.status }}</td>
          <td class="border p-2">
            <button @click="openModal(issue)" class="bg-blue-500 text-white px-3 py-1 rounded">
              Rediģēt
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="isModalOpen" class="modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="modal-content bg-white p-6 rounded shadow-lg w-full max-w-2xl">
        <h2 class="text-lg font-bold mb-4">Rediģēt problēmu</h2>

        <p><strong>E-pasts:</strong> {{ selectedIssue.email }}</p>
        <p><strong>Izveidots:</strong> {{ new Date(selectedIssue.created_at).toLocaleString() }}</p>
        <p><strong>Nosaukums:</strong> {{ selectedIssue.title }}</p>
        <p><strong>Apraksts:</strong> {{ selectedIssue.description }}</p>

        <label class="block mt-2 mb-1 font-semibold">Kopējais statuss:</label>
        <select v-model="selectedIssue.status" class="border p-2 w-full mb-4">
          <option v-for="status in statuses" :key="status" :value="status">{{ status }}</option>
        </select>

        <h3 class="font-semibold mb-2">Inventāra vienības</h3>
        <ul class="mb-4">
          <li v-for="item in selectedIssue.items" :key="items.item_id" class="mb-2">
            {{ items.item_title }}:
            <select v-model="item.status" class="border p-1 ml-2">
              <option v-for="status in statuses" :key="status" :value="status">{{ status }}</option>
            </select>
          </li>
        </ul>

        <h3 class="font-semibold mb-2">Komentāri</h3>
        <div class="comments-section mb-4">
          <div v-for="(c, idx) in comments" :key="idx" class="mb-2 border-b pb-1">
            <p><strong>{{ c.email }}</strong> <em>{{ new Date(c.created_at).toLocaleString() }}</em></p>
            <p>{{ c.comment }}</p>
          </div>
        
        <textarea v-model="newComment" placeholder="Pievieno komentāru..." rows="3"
            class="border p-2 w-full mb-2"></textarea>
          <button @click="submitComment" class="bg-green-500 text-white px-3 py-1 rounded">Pievienot komentāru</button>
        </div>

        <div class="flex justify-end gap-2 mt-4">
          <button @click="updateIssue" class="bg-blue-500 text-white px-4 py-2 rounded">Saglabāt</button>
          <button @click="closeModal" class="bg-gray-400 text-white px-4 py-2 rounded">Aizvērt</button>
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

.issue-container {
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
  background: #4caf50;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 4px;
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

.comments-section {
  margin-top: 1rem;
}

.comment {
  border-bottom: 1px solid #ddd;
  padding-bottom: 0.5rem;
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

