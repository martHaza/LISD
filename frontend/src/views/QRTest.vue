<template>
    <div class="scanner">
      <video ref="video" autoplay playsinline></video>
      <button @click="switchCamera">Pārslēgt kameru</button>
      <p v-if="result">Skenēšanas rezultāts: <strong>{{ result }}</strong></p>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  import { BrowserMultiFormatReader } from '@zxing/browser';
  
  const video = ref(null);
  const result = ref('');
  const codeReader = new BrowserMultiFormatReader();
  let devices = [];
  let currentDeviceIndex = 0;
  let currentStream = null;
  
  const startScanner = async (deviceId) => {
    if (currentStream) {
      currentStream.getTracks().forEach(track => track.stop());
    }
  
    await codeReader.decodeFromVideoDevice(
      deviceId,
      video.value,
      (res, err) => {
        if (res) {
          result.value = res.getText();
          // codeReader.reset();
        }
      }
    );
  };
  
  const switchCamera = async () => {
    currentDeviceIndex = (currentDeviceIndex + 1) % devices.length;
    const deviceId = devices[currentDeviceIndex].deviceId;
    await startScanner(deviceId);
  };
  
  onMounted(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
  
      devices = await BrowserMultiFormatReader.listVideoInputDevices();
  
      if (!devices.length) {
        console.warn('No camera devices found');
        return;
      }
  
      await startScanner(devices[currentDeviceIndex].deviceId);
    } catch (err) {
      console.error('Camera error:', err);
    }
  });
  
  onBeforeUnmount(() => {
    codeReader.reset();
    if (currentStream) {
      currentStream.getTracks().forEach(track => track.stop());
    }
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
  button {
    padding: 0.5rem 1rem;
    font-weight: bold;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }
  button:hover {
    background-color: #0056b3;
  }
  </style>
  