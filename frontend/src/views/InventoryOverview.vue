<script setup>
import { ref, onMounted, computed} from 'vue';
import api from "../services/api";
import { useAuthStore } from "./../store/auth";

const items = ref([]);
// const facLocation = ref([]);
// const jurLocation = ref([]);
// const tempLocation = ref([]);
// const responsiblePersons = ref([]);
const searchQuery = ref('');
// const selectedLocation = ref('');
// const selectedPerson = ref('');
// const showCreateModal = ref(false);
const authStore = useAuthStore();

const fetchItems = async () => {
  console.log('Fetching items from API...');
  try {
    const response = await api.get('/items');
    console.log('Response:', response.data);
    items.value = response.data;
  } catch (error) {
    console.error('Error fetching items', error);
  }
};

const filteredItems = computed(() => {
    const query = searchQuery.value.toLowerCase();
    return items.value.filter(item =>
        item.title?.toLowerCase().includes(query) || item.code?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
    );
});

onMounted(() => {
  fetchItems();
});
</script>

<template>
  <div class="p-4">
    <h1 class="text-xl font-bold mb-4">Inventāra pārvaldība</h1>

    <div class="mb-4">
      <input type="text" v-model="searchQuery" placeholder="Meklēt" class="border p-2 w-full" />
      <label for="role-filter" class="mr-2">Inventāra pārskats</label>
    </div>

    <table class="w-full border-collapse border border-gray-300">
      <thead>
        <tr class="bg-gray-100">
          <th class="border p-2">Item ID</th>
          <th class="border p-2">Nosaukums</th>
          <th class="border p-2">Numurs</th>
          <th class="border p-2">Kods</th>
          <th class="border p-2">Apraksts</th>
          <th class="border p-2">Ekspluatācijas datums</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in filteredItems" :key="item.item_id" class="border">
          <td class="border p-2">{{ item.item_id }}</td>
          <td class="border p-2">{{ item.title }}</td>
          <td class="border p-2">{{ item.item_number }}</td>
          <td class="border p-2">{{ item.item_code }}</td>
          <td class="border p-2">{{ item.description }}</td>
          <td class="border p-2">{{ item.exploitation_date }}</td>
        </tr>
      </tbody>
    </table>
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

.border {
  border: 1px solid #ddd;
}

.p-2 {
  padding: 0.5rem;
}

.w-full {
  width: 100%;
}

.table {
  border-collapse: collapse;
  width: 100%;
}

tr:hover {
  background-color: #f0f0f0;
  transition: background-color 0.2s ease-in-out;
}

</style>
