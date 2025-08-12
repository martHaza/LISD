<script setup>
import { ref, onMounted, computed} from 'vue';
import api from "../services/api";
import { useAuthStore } from "../stores/auth";

const items = ref([]);
const facLocation = ref([]);
const jurLocation = ref([]);
const tempLocation = ref([]);
const responsiblePersons = ref([]);
const searchQuery = ref('');
const selectedLocation = ref('');
const selectedPerson = ref('');
const showCreateModal = ref(false);
const showEditModal = ref(false);
const authStore = useAuthStore();

const newItem = ({ title: '', item_number: '', item_code: '', description: '', exploitation_date: '', juridical_location_id: '',
  factual_location_id: '', temp_location_id: '', user_type: 'Local' });

const fetchItems = async () => {
  try {
    const response = await api.get('/items');
    items.value = response.data;
  } catch (error) {
    console.error('Error fetching items', error);
  }
};

const fetchUsers = async () => {
  try {
    const response = await api.get('/users');
    responsiblePersons.value = response.data;
  } catch (error) {
    console.error('Error fetching users', error);
  }
}

const fetchLocations = async () => {
  try {
    const jur = await api.get('/juridical-location');
    jurLocation.value = jur.data;

    const fac = await api.get('/factual-location');
    facLocation.value = fac.data;

    const temp = await api.get('/temporary-location');
    tempLocation.value = temp.data;
  } catch (error) {
    console.error('Error fetching locations', error);
  }
}

const openCreateModal = () => {
  showCreateModal.value = true;
};

const closeCreateModal = () => {
  showCreateModal.value = false;
  newItem.value = { title: '', item_number: '', item_code: '', description: '', exploitation_date: '', juridical_location_id: '',
  factual_location_id: '', temp_location_id: '', user_type: 'Local' };
};

const openEditModal = (user) => {
  selectedUser.value = { ...user };
  showEditModal.value = true;
}

const closeEditModal = () => {
  showEditModal.value = false;
}

const saveNewItem = async () => {
  try {
    await api.post('/inventory', newItem.value);
    closeCreateModal();
    fetchInventory();
  } catch (error) {
    console.error('Error creating inventory item:', error);
  }
};

const filteredItems = computed(() => {
    return items.value.filter(item => {
    const matchesResponsible =
      !selectedPerson.value || item.user_id === selectedPerson.value;
    const matchesFactual =
      !selectedFactualLocation.value || item.factual_location_id === selectedFactualLocation.value;
    const matchesJuridical =
      !selectedJuridicalLocation.value || item.juridical_location_id === selectedJuridicalLocation.value;
    const matchesTemp =
      !selectedTempLocation.value || item.temp_location_id === selectedTempLocation.value;
    const matchesSearch =
      item.title?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.item_number?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.item_code?.toLowerCase().includes(searchQuery.value.toLowerCase());
    return matchesResponsible && matchesFactual && matchesJuridical && matchesTemp && matchesSearch;
  });
});

const generateReport = () => {
  console.log("Generating report for:", filteredItems.value);
};

onMounted(() => {
  fetchItems();
  fetchUsers();
  fetchLocations();
});
</script>

<template>
  <div class="p-4">
    <h1 class="text-xl font-bold mb-4">Inventāra pārvaldība</h1>

    <div class="mb-4">
      <input type="text" v-model="searchQuery" placeholder="Meklēt" class="border p-2 w-full" />
      <label for="role-filter" class="mr-2">Filtrēt pēc personām:</label>
      <select v-model="selectedPerson" class="border p-2">
        <option value="">Visas personas</option>
        <option v-for="user in responsiblePersons" :key="user.user_id" :value="user.user_id">
          {{ user.username || user.email }}
          </option>
          <button @click="openCreateModal" class="bg-green-500 text-white px-3 py-1 rounded">Pievienot inventāru</button>
      </select>
    </div>

    <table class="w-full border-collapse border border-gray-300">
      <thead>
        <tr class="bg-gray-100">
          <th class="border p-2">Nosaukums</th>
          <th class="border p-2">Numurs</th>
          <th class="border p-2">Kods</th>
          <th class="border p-2">Apraksts</th>
          <th class="border p-2">Ekspluatācijas datums</th>
          <th class="border p-2">Faktiskā atrašanās vieta</th>
          <th class="border p-2">Juridiskā atrašanās vieta</th>
          <th class="border p-2">Pagaidu atrašanās vieta</th>
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
          <td class="border p-2">{{ findUserById(item.user_id)?.username || findUserById(item.user_id)?.email || '-' }}</td>
          <td class="border p-2">{{ findFactualLocationById(item.factual_location_id)?.name || '-' }}</td>
          <td class="border p-2">{{ findJuridicalLocationById(item.juridical_location_id)?.name || '-' }}</td>
          <td class="border p-2">{{ findTempLocationById(item.temp_location_id)?.name || '-' }}</td>
           <td class="border p-2">
            <button @click="openEditModal(item)" class="bg-blue-500 text-white px-3 py-1 rounded">Rediģēt</button>
          </td>
        </tr>
      </tbody>
    </table>

     <!-- Create Inventory Modal -->
    <div v-if="showCreateModal" class="modal-container">
      <div class="modal-content">
        <h2 class="text-lg font-bold mb-4">Pievienot jaunu inventāru</h2>

        <input v-model="newItem.title" placeholder="Nosaukums" class="border p-2 w-full mb-2"/>
        <input v-model="newItem.item_number" placeholder="Numurs" class="border p-2 w-full mb-2"/>
        <input v-model="newItem.item_code" placeholder="Kods" class="border p-2 w-full mb-2"/>
        <textarea v-model="newItem.description" placeholder="Apraksts" class="border p-2 w-full mb-2" rows="3"></textarea>
        <input type="date" v-model="newItem.exploitation_date" placeholder="Ekspluatācijas datums" class="border p-2 w-full mb-2"/>

        <label class="block mb-1 font-semibold">Atbildīgā persona:</label>
        <select v-model="newItem.user_id" class="border p-2 w-full mb-2"required>
          <option value="" disabled>Izvēlieties personu</option>
          <option v-for="user in responsiblePersons":key="user.user_id":value="user.user_id">
            {{ user.username || user.email }}
          </option>
        </select>

        <label class="block mb-1 font-semibold">Faktiskā atrašanās vieta:</label>
        <select v-model="newItem.factual_location_id" class="border p-2 w-full mb-2">
          <option value="">Nav</option>
          <option v-for="loc in factualLocations":key="loc.id":value="loc.id">
            {{ loc.name }}
          </option>
        </select>

        <label class="block mb-1 font-semibold">Juridiskā atrašanās vieta:</label>
        <select v-model="newItem.juridical_location_id" class="border p-2 w-full mb-2">
          <option value="">Nav</option>
          <option v-for="loc in juridicalLocations":key="loc.id":value="loc.id">
            {{ loc.name }}
          </option>
        </select>

        <label class="block mb-1 font-semibold">Pagaidu atrašanās vieta:</label>
        <select v-model="newItem.temp_location_id" class="border p-2 w-full mb-4">
          <option value="">Nav</option>
          <option v-for="loc in tempLocations":key="loc.id":value="loc.id">
            {{ loc.name }}
          </option>
        </select>

        <div class="flex justify-end gap-2">
          <button @click="closeCreateModal" class="bg-gray-400 text-white px-4 py-2 rounded">Atcelt</button>
          <button @click="saveNewItem"class="bg-green-500 text-white px-4 py-2 rounded">Saglabāt</button>
        </div>
        </div>
      </div>

      <!-- Edit Modal -->
    <div v-if="showEditModal" class="modal-container">
      <div class="modal-content">
        <h2 class="text-lg font-bold mb-4">Rediģēt inventāru</h2>

        <label class="block mb-2 font-semibold">Nosaukums</label>
        <input v-model="editItem.title" placeholder="Nosaukums" class="border p-2 w-full mb-4" />

        <label class="block mb-2 font-semibold">Numurs</label>
        <input v-model="editItem.item_number" placeholder="Numurs" class="border p-2 w-full mb-4" />

        <label class="block mb-2 font-semibold">Kods</label>
        <input v-model="editItem.item_code" placeholder="Kods" class="border p-2 w-full mb-4" />

        <label class="block mb-2 font-semibold">Apraksts</label>
        <textarea v-model="editItem.description" placeholder="Apraksts" class="border p-2 w-full mb-4"></textarea>

        <label class="block mb-2 font-semibold">Ekspluatācijas datums</label>
        <input v-model="editItem.exploitation_date" type="date" class="border p-2 w-full mb-4" />

        <label class="block mb-2 font-semibold">Atbildīgais</label>
        <select v-model="editItem.user_id" class="border p-2 w-full mb-4">
          <option value="">Izvēlēties personu</option>
          <option v-for="user in responsiblePersons" :key="user.user_id" :value="user.user_id">
            {{ user.username || user.email }}
          </option>
        </select>

        <label class="block mb-2 font-semibold">Faktiskā atrašanās vieta</label>
        <select v-model="editItem.factual_location_id" class="border p-2 w-full mb-4">
          <option value="">Izvēlēties atrašanās vietu</option>
          <option v-for="loc in factualLocations" :key="loc.id" :value="loc.id">{{ loc.name }}</option>
        </select>

        <label class="block mb-2 font-semibold">Juridiskā atrašanās vieta</label>
        <select v-model="editItem.juridical_location_id" class="border p-2 w-full mb-4">
          <option value="">Izvēlēties atrašanās vietu</option>
          <option v-for="loc in juridicalLocations" :key="loc.id" :value="loc.id">{{ loc.name }}</option>
        </select>

        <label class="block mb-2 font-semibold">Pagaidu atrašanās vieta</label>
        <select v-model="editItem.temp_location_id" class="border p-2 w-full mb-4">
          <option value="">Izvēlēties atrašanās vietu</option>
          <option v-for="loc in tempLocations" :key="loc.id" :value="loc.id">{{ loc.name }}</option>
        </select>

        <div class="flex justify-end gap-2 mt-4">
          <button @click="closeEditModal" class="bg-gray-400 text-white px-4 py-2 rounded">Atcelt</button>
          <button @click="saveEditItem" class="bg-green-500 text-white px-4 py-2 rounded">Saglabāt</button>
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

.fixed {
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
}

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

.modal-content {
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.2);
  width: 400px;
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
  background: #4CAF50;
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
