<template>
    <div class="gallery">
        <div v-for="img in images" :key="img" class="image-wrapper">
            <img :src="`${baseUrl}/api/image/${img}`" alt="Uploaded image" />
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

<style scoped>
.gallery {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
    padding: 10px;
}

.image-wrapper {
    max-width: 100%;
    width: 100%;
}

.image-wrapper img {
    width: 100%;
    height: auto;
    display: block;
    object-fit: cover;
    /* border-radius: 6px; */
}
</style>