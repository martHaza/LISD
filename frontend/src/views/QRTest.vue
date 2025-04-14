<template>
    <div class="scanner">
      <video ref="video" autoplay></video>
      <p v-if="result">Skenešanas rezultāts: <strong>{{ result }}</strong></p>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  import { BrowserMultiFormatReader } from '@zxing/browser';
  
  const video = ref(null);
  const result = ref('');
  let codeReader;
  
  onMounted(async () => {
    codeReader = new BrowserMultiFormatReader();
  
    try {
      const devices = await BrowserMultiFormatReader.listVideoInputDevices();
      const selectedDeviceId = devices[0]?.deviceId;
  
      if (!selectedDeviceId) {
        console.warn('No camera device found');
        return;
      }
  
      await codeReader.decodeFromVideoDevice(
        selectedDeviceId,
        video.value,
        (res, err) => {
          if (res) {
            result.value = res.getText();
            codeReader.reset();
          }
        }
      );
    } catch (err) {
      console.error('Error initializing scanner:', err);
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
  }
  video {
    width: 100%;
    max-width: 400px;
    border: 2px solid #ccc;
    border-radius: 8px;
  }
  </style>
  