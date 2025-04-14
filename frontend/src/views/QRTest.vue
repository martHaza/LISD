<template>
    <div class="scanner">
        <select v-if="videoDevices.length" v-model="selectedDeviceId" @change="startScanner">
        <option v-for="device in videoDevices" :key="device.deviceId" :value="device.deviceId">
            {{ device.label || 'Camera ' + device.deviceId }}
        </option>
        </select>

        <video ref="video" autoplay playsinline></video>

        <p v-if="result">Skenēšanas rezultāts: <strong>{{ result }}</strong></p>
        <p v-if="error" style="color: red">{{ error }}</p>
    </div>
</template>
  
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { BrowserMultiFormatReader } from '@zxing/browser';

const video = ref(null);
const result = ref('');
const error = ref('');
const videoDevices = ref([]);
const selectedDeviceId = ref('');
let codeReader;

const startScanner = async () => {
if (!selectedDeviceId.value) return;

if (codeReader) {
    codeReader.reset();
}

codeReader = new BrowserMultiFormatReader();
await codeReader.decodeFromVideoDevice(
    selectedDeviceId,
    video.value,
    (res, err) => {
    if (res) {
        result.value = res.getText();
        // codeReader.reset();
    }
    }
);
};

onMounted(async () => {
try {
    await navigator.mediaDevices.getUserMedia({ video: true });

    const devices = await BrowserMultiFormatReader.listVideoInputDevices();
    videoDevices.value = devices;

    if (devices.length > 0) {
    // Try to select back camera first
    const backCam = devices.find((d) =>
        d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('environment')
    );

    selectedDeviceId.value = backCam?.deviceId || devices[0].deviceId;
    await startScanner();
    } else {
    error.value = 'No cameras found.';
    }
} catch (err) {
    error.value = 'Cannot access camera.';
    console.error(err);
}
});

onBeforeUnmount(() => {
codeReader?.reset();
});
</script>

<style scoped>
    .scanner {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
    }
    video {
        width: 100%;
        max-width: 400px;
        border: 2px solid #ccc;
        border-radius: 8px;
    }
    select {
        padding: 0.5rem;
        font-size: 1rem;
    }
</style>
