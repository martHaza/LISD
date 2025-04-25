<template>
  <div class="container">
    <button @click="toggleCamera">
      {{ usingCamera ? 'Izmantot failu pārlūku' : 'Izmantot kameru' }}
    </button>
    <video ref="video" autoplay playsinline v-show="!photoTaken && usingCamera"></video>
    <canvas ref="canvas" v-show="photoTaken && usingCamera"></canvas>
    <div v-if="previewUrl && !usingCamera" class="image-preview">
      <img :src="previewUrl" alt="Preview" />
    </div>

    <div class="controls">

      <input v-if="!usingCamera" type="file" accept="image/*" @change="handleFileChange" />
      <button v-if="usingCamera && !photoTaken" @click="takePhoto">Uzņemt</button>
    </div>

    <div v-if="canSubmit" class="controls">
      <button @click="submitImage">Iesniegt</button>
      <button @click="clear">Dzēst</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import api from '../services/api';

const video = ref(null);
const canvas = ref(null);
const stream = ref(null);
const previewUrl = ref(null);
const selectedFile = ref(null);
const photoTaken = ref(false);
const usingCamera = ref(false);

const canSubmit = computed(() => selectedFile.value || (photoTaken.value && usingCamera.value));

async function toggleCamera() {
  clear();
  usingCamera.value = !usingCamera.value;
  if (usingCamera.value) {
    try {
      stream.value = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' }
        }
      });
      video.value.srcObject = stream.value;
    } catch (err) {
      console.error('Camera access failed', err);
      usingCamera.value = false;
    }
  } else {
    stopCamera();
  }
}

async function resizeImage(file, maxWidth = 1024, maxHeight = 1024) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      let { width, height } = img;

      const scale = Math.min(maxWidth / width, maxHeight / height, 1);
      width = width * scale;
      height = height * scale;

      const offscreenCanvas = document.createElement('canvas');
      offscreenCanvas.width = width;
      offscreenCanvas.height = height;
      const ctx = offscreenCanvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      offscreenCanvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.8); //affects quality
    };
    img.src = url;
  });
}

function stopCamera() {
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop());
    stream.value = null;
  }
}

onBeforeUnmount(() => stopCamera());

function takePhoto() {
  const context = canvas.value.getContext('2d');
  canvas.value.width = video.value.videoWidth;
  canvas.value.height = video.value.videoHeight;
  context.drawImage(video.value, 0, 0);
  canvas.value.toBlob(async (blob) => {
    if (blob) {
      const resized = await resizeImage(blob);
      selectedFile.value = resized;
      previewUrl.value = URL.createObjectURL(resized);
      photoTaken.value = true;
    }
  }, 'image/jpeg');
}

async function handleFileChange(e) {
  const file = e.target.files[0];
  if (file && file.type.startsWith('image/')) {
    const resized = await resizeImage(file);
    selectedFile.value = resized;
    previewUrl.value = URL.createObjectURL(resized);
    photoTaken.value = false;
    usingCamera.value = false;
  }
}

function clear() {
  selectedFile.value = null;
  previewUrl.value = null;
  photoTaken.value = false;
}

async function submitImage() {
  if (!selectedFile.value) {
    alert('Nav izvēlēts attēls');
    return;
  }

  const formData = new FormData();
  formData.append('image', selectedFile.value);

  try {
    const res = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    console.log('Upload success:', res.data);
    alert('Augšupielāde veiksmīga!');
    clear();
  } catch (err) {
    console.error('Upload failed:', err);
    alert('Augšupielāde neizdevās.');
  }
}
</script>

<style scoped>
.container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

video,
canvas,
.image-preview img {
  max-width: 100%;
  width: 100%;
  height: auto;
  object-fit: cover;
}

.controls {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
</style>