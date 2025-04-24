<template>
  <div class="flex flex-col gap-4 items-start">

    <video ref="video" autoplay playsinline class="w-64 h-64 border rounded object-cover" v-show="!photoTaken && usingCamera"></video>

    <canvas ref="canvas" class="w-64 h-64 border rounded object-cover" v-show="photoTaken && usingCamera"></canvas>

    <div v-if="previewUrl && !usingCamera" class="w-64 h-64 border rounded overflow-hidden">
      <img :src="previewUrl" alt="Preview" class="w-full h-full object-cover" />
    </div>

    <div class="flex gap-2">
      <button @click="toggleCamera" class="btn">
        {{ usingCamera ? 'Izmantot failu pārlūku' : 'Izmantot kameru' }}
      </button>

      <input v-if="!usingCamera"
        type="file"
        accept="image/*"
        @change="handleFileChange"
        class="file-input file-input-bordered w-full max-w-xs"
      />
      <button v-if="usingCamera && !photoTaken" @click="takePhoto" class="btn btn-primary">Uzņemt</button>
    </div>

    <div v-if="canSubmit" class="flex gap-2">
      <button @click="submitImage" class="btn btn-success">Iesniegt</button>
      <button @click="clear" class="btn btn-outline">Dzēst</button>
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
      stream.value = await navigator.mediaDevices.getUserMedia({ video: true });
      video.value.srcObject = stream.value;
    } catch (err) {
      console.error('Camera access failed', err);
      usingCamera.value = false;
    }
  } else {
    stopCamera();
  }
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
  canvas.value.toBlob(blob => {
    if (blob) {
      selectedFile.value = blob;
      previewUrl.value = URL.createObjectURL(blob);
      photoTaken.value = true;
    }
  }, 'image/jpeg');
}

function handleFileChange(e) {
  const file = e.target.files[0];
  if (file && file.type.startsWith('image/')) {
    selectedFile.value = file;
    previewUrl.value = URL.createObjectURL(file);
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
