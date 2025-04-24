<template>
    <div class="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
        <div v-for="img in images" :key="img" class="border rounded overflow-hidden">
        <img :src="`${baseUrl}/api/image/${img}`" alt="Uploaded image" class="w-full object-cover" />
        </div>
    </div>
</template>
  
<script setup>
    import { onMounted, ref } from 'vue';
    import api from '../services/api';

    const images = ref([]);
    const baseUrl = import.meta.env.VITE_API_BASE_URL;

    onMounted(async () => {
    try {
        const res = await api.get('/images');
        images.value = res.data.images;
    } catch (err) {
        console.error('Failed to load gallery', err);
    }
    });
</script>
  