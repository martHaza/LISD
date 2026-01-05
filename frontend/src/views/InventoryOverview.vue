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

const selectedJuridicalLocation = ref('');
const selectedFactualLocation = ref('');
const selectedTempLocation = ref('');
const selectedPerson = ref('');

const showCreateModal = ref(false);
const showEditModal = ref(false);
const selectedItem = ref(null);
const authStore = useAuthStore();

const newItem = ref({ title: '', item_number: '', item_code: '', description: '', exploitation_date: '', juridical_location_id: '',
  factual_location_id: '', temp_location_id: '', user_type: 'Local' });

const fetchItems = async () => {
  try {
    const response = await api.get('/items');
    items.value = response.data;
  } catch (error) {
    console.error('Error fetching items', error);

    items.value = [];
  }
};

const fetchUsers = async () => {
  try {
    const response = await api.get('/users');
    responsiblePersons.value = response.data;
  } catch (error) {
    console.error('Error fetching users', error);

    responsiblePersons.value = [];
  }
}

const fetchLocations = async () => {
  try {
    const jur = await api.get('/juridical');
    jurLocation.value = jur.data;
    console.log('Juridical locations loaded:', jurLocation.value);

    const fac = await api.get('/factual');
    facLocation.value = fac.data;
    console.log('Factual locations loaded:', facLocation.value);

    const temp = await api.get('/temporary');
    tempLocation.value = temp.data;
    console.log('Temporary locations loaded:', tempLocation.value);
  } catch (error) {
    console.error('Error fetching locations', error);

    jurLocation.value = [];
    facLocation.value = [];
    tempLocation.value = [];
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

const openEditModal = (item) => {
  selectedItem.value = { ...item };
  showEditModal.value = true;
}

const closeEditModal = () => {
  showEditModal.value = false;
}

const saveNewItem = async () => {
  try {
    await api.post('/items', newItem.value);
    closeCreateModal();
    fetchItems();
  } catch (error) {
    console.error('Error creating inventory item:', error);
  }
};

const saveEditItem = async () => {
  try {
    await api.put(`/items/${selectedItem.value.item_id}`, selectedItem.value);
    await fetchItems();
    closeEditModal();
  } catch (error) {
    console.error('Error updating item:', error.response?.data || error.message);
  }
};

const findUserById = (id) => responsiblePersons.value.find(u => u.user_id === id);
const findFactualLocationById = (id) => facLocation.value.find(l => l.id === id);
const findJuridicalLocationById = (id) => jurLocation.value.find(l => l.id === id);
const findTempLocationById = (id) => tempLocation.value.find(l => l.id === id);

// const filteredItems = computed(() => {
//     return items.value.filter(item => {
//     const matchesResponsible =
//       !selectedPerson.value || item.user_id === selectedPerson.value;
//     const matchesFactual =
//       !selectedFactualLocation.value || item.factual_location_id === selectedFactualLocation.value;
//     const matchesJuridical =
//       !selectedJuridicalLocation.value || item.juridical_location_id === selectedJuridicalLocation.value;
//     const matchesTemp =
//       !selectedTempLocation.value || item.temp_location_id === selectedTempLocation.value;
//     const matchesSearch =
//       item.title?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
//       item.item_number?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
//       item.item_code?.toLowerCase().includes(searchQuery.value.toLowerCase());
//     return matchesResponsible && matchesFactual && matchesJuridical && matchesTemp && matchesSearch;
//   });
// });
const filteredItems = computed(() => {
  const q = searchQuery.value.toLowerCase();

  return items.value.filter(item => {
    const matchesResponsible =
      !selectedPerson.value ||
      item.user_email?.toLowerCase() === selectedPerson.value.toLowerCase();

    const matchesFactual =
      !selectedFactualLocation.value ||
      item.factual_location === selectedFactualLocation.value;

    const matchesJuridical =
      !selectedJuridicalLocation.value ||
      item.juridical_location === selectedJuridicalLocation.value;

    const matchesTemp =
      !selectedTempLocation.value ||
      item.temp_location === selectedTempLocation.value;

    const matchesSearch =
      item.title?.toLowerCase().includes(q) ||
      item.item_number?.toLowerCase().includes(q) ||
      item.item_code?.toLowerCase().includes(q) ||
      item.user_email?.toLowerCase().includes(q);

    return (
      matchesResponsible &&
      matchesFactual &&
      matchesJuridical &&
      matchesTemp &&
      matchesSearch
    );
  });
});


const generateReport = () => {
  if (!filteredItems.value.length) {
    alert("Nav datu, ko ģenerēt pārskatā.");
    return;
}

const headers = [
    "Nosaukums",
    "Numurs",
    "Kods",
    "Apraksts",
    "Ekspluatācijas datums",
    "Atbildīgā persona",
    "Faktiskā atrašanās vieta",
    "Juridiskā atrašanās vieta",
    "Pagaidu atrašanās vieta"
  ];

  const lines = filteredItems.value.map(item => {
    const user = findUserById(item.user_id);
    return [
      item.title,
      item.item_number,
      item.item_code,
      item.description,
      item.exploitation_date,
      item.user_email,
      // user ? user.username || user.email : "-",
      item.factual_location,
      item.juridical_location,
      item.temp_location,
      // findFactualLocationById(item.factual_location_id)?.room || "-",
      // findJuridicalLocationById(item.juridical_location_id)?.room || "-",
      // findTempLocationById(item.temp_location_id)?.room || "-"

    ].join("\t"); 
  });

  const tsvContent = [headers.join("\t"), ...lines].join("\n");
  const blob = new Blob([tsvContent], { type: "text/tab-separated-values" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `inventara_parskats_${new Date().toISOString().split("T")[0]}.tsv`;
  a.click();
  URL.revokeObjectURL(url);
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

      <!-- <label for="role-filter" class="mr-2">Filtrēt pēc personām:</label>
      <select v-model="selectedPerson" class="border p-2">
        <option value="">Visas personas</option>
        <option v-for="user in responsiblePersons" :key="user.user_id" :value="user.user_id">
          {{ user.username || user.email }}
          </option>
      </select> -->

      <label for="role-filter" class="mr-2">Filtrēt pēc personām:</label>
      <select v-model="selectedPerson" class="border p-2">
        <option value="">Visas personas</option>
        <option
          v-for="user in responsiblePersons"
          :key="user.user_id"
          :value="user.email"
        >
          {{ user.username || user.email }}
        </option>
      </select>

      <!-- <label for="factual-filter" class="ml-2">Faktiskā:</label>
      <select v-model="selectedFactualLocation" class="border p-2">
        <option value="">Visas</option>
        <option v-for="loc in facLocation" :key="loc.location_id" :value="loc.location_id">
          {{ loc.room }}
          </option>
      </select>

      <label for="juridical-filter" class="ml-2">Juridiskā:</label>
      <select v-model="selectedJuridicalLocation" class="border p-2">
        <option value="">Visas</option>
        <option v-for="loc in jurLocation" :key="loc.location_id" :value="loc.location_id">
          {{ loc.room }}
          </option>
      </select>

      <label for="temp-filter" class="ml-2">Pagaidu:</label>
      <select v-model="selectedTempLocation" class="border p-2">
        <option value="">Visas</option>
        <option v-for="loc in tempLocation" :key="loc.location_id" :value="loc.location_id">
          {{ loc.room }}
          </option>
      </select> -->

      <label for="factual-filter" class="ml-2">Faktiskā:</label>
      <select v-model="selectedFactualLocation" class="border p-2">
        <option value="">Visas</option>
        <option
          v-for="loc in facLocation"
          :key="loc.location_id"
          :value="loc.room"
        >
          {{ loc.room }}
        </option>
      </select>

      <label for="juridical-filter" class="ml-2">Juridiskā:</label>
      <select v-model="selectedJuridicalLocation" class="border p-2">
        <option value="">Visas</option>
        <option
          v-for="loc in jurLocation"
          :key="loc.location_id"
          :value="loc.room"
        >
          {{ loc.room }}
        </option>
      </select>

      <label for="temp-filter" class="ml-2">Pagaidu:</label>
      <select v-model="selectedTempLocation" class="border p-2">
        <option value="">Visas</option>
        <option
          v-for="loc in tempLocation"
          :key="loc.location_id"
          :value="loc.room"
        >
          {{ loc.room }}
        </option>
      </select>


      <button @click="openCreateModal" class="bg-green-500 text-white px-3 py-1 rounded">Pievienot inventāru</button>
      <button @click="generateReport" class="bg-blue-500 text-white px-3 py-1 rounded ml-2">Ģenerēt pārskata apkopojumu</button>
    </div>

    <table class="w-full border-collapse border border-gray-300">
      <thead>
        <tr class="bg-gray-100">
          <th class="border p-2">Nosaukums</th>
          <th class="border p-2">Numurs</th>
          <th class="border p-2">Kods</th>
          <th class="border p-2">Apraksts</th>
          <th class="border p-2">Ekspluatācijas datums</th>
          <th class="border p-2">Atbildīgā persona</th>
          <th class="border p-2">Faktiskā atrašanās vieta</th>
          <th class="border p-2">Juridiskā atrašanās vieta</th>
          <th class="border p-2">Pagaidu atrašanās vieta</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in filteredItems" :key="item.item_id" class="border">
          <!-- <td class="border p-2">{{ item.item_id }}</td> -->
          <td class="border p-2">{{ item.title }}</td>
          <td class="border p-2">{{ item.item_number }}</td>
          <td class="border p-2">{{ item.item_code }}</td>
          <td class="border p-2">{{ item.description }}</td>
          <td class="border p-2">{{ item.exploitation_date }}</td>
          <td class="border p-2">{{ item.user_email || '-' }}</td>
          <td class="border p-2">{{ item.factual_location || '-' }}</td>
          <td class="border p-2">{{ item.juridical_location || '-' }}</td>
          <td class="border p-2">{{ item.temp_location || '-' }}</td>
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
          <option v-for="user in responsiblePersons" :key="user.user_id" :value="user.user_id">
            {{ user.username || user.email }}
          </option>
        </select>

        <label class="block mb-1 font-semibold">Faktiskā atrašanās vieta:</label>
        <select v-model="newItem.factual_location_id" class="border p-2 w-full mb-2">
          <option value="">Nav</option>
          <option v-for="loc in facLocation" :key="loc.location_id" :value="loc.location_id">
            {{ loc.name }}
          </option>
        </select>

        <label class="block mb-1 font-semibold">Juridiskā atrašanās vieta:</label>
        <select v-model="newItem.juridical_location_id" class="border p-2 w-full mb-2">
          <option value="">Nav</option>
          <option v-for="loc in jurLocation" :key="loc.location_id" :value="loc.location_id">
            {{ loc.name }}
          </option>
        </select>

        <label class="block mb-1 font-semibold">Pagaidu atrašanās vieta:</label>
        <select v-model="newItem.temp_location_id" class="border p-2 w-full mb-4">
          <option value="">Nav</option>
          <option v-for="loc in tempLocation" :key="loc.location_id" :value="loc.location_id">
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
        <input v-model="selectedItem.title" placeholder="Nosaukums" class="border p-2 w-full mb-4" />

        <label class="block mb-2 font-semibold">Numurs</label>
        <input v-model="selectedItem.item_number" placeholder="Numurs" class="border p-2 w-full mb-4" />

        <label class="block mb-2 font-semibold">Kods</label>
        <input v-model="selectedItem.item_code" placeholder="Kods" class="border p-2 w-full mb-4" />

        <label class="block mb-2 font-semibold">Apraksts</label>
        <textarea v-model="selectedItem.description" placeholder="Apraksts" class="border p-2 w-full mb-4"></textarea>

        <label class="block mb-2 font-semibold">Ekspluatācijas datums</label>
        <input v-model="selectedItem.exploitation_date" type="date" class="border p-2 w-full mb-4" />

        <label class="block mb-2 font-semibold">Atbildīgais</label>
        <select v-model="selectedItem.user_id" class="border p-2 w-full mb-4">
          <option value="">Izvēlēties personu</option>
          <option v-for="user in responsiblePersons" :key="user.user_id" :value="user.user_id">
            {{ user.username || user.email }}
          </option>
        </select>

        <label class="block mb-2 font-semibold">Faktiskā atrašanās vieta</label>
        <select v-model="selectedItem.factual_location_id" class="border p-2 w-full mb-4">
          <option value="">Izvēlēties atrašanās vietu</option>
          <option v-for="loc in facLocation" :key="loc.location_id" :value="loc.location_id">
            {{ loc.name }}</option>
        </select>

        <label class="block mb-2 font-semibold">Juridiskā atrašanās vieta</label>
        <select v-model="selectedItem.juridical_location_id" class="border p-2 w-full mb-4">
          <option value="">Izvēlēties atrašanās vietu</option>
          <option v-for="loc in jurLocation" :key="loc.location_id" :value="loc.location_id">
            {{ loc.name }}</option>
        </select>

        <label class="block mb-2 font-semibold">Pagaidu atrašanās vieta</label>
        <select v-model="selectedItem.temp_location_id" class="border p-2 w-full mb-4">
          <option value="">Izvēlēties atrašanās vietu</option>
          <option v-for="loc in tempLocation" :key="loc.location_id" :value="loc.location_id">
            {{ loc.name }}</option>
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
