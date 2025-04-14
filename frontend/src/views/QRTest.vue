<template>
    <div class="scanner">
      <video ref="video" autoplay playsinline></video>
      <p v-if="result">Skenešanas rezultāts: <strong>{{ result }}</strong></p>
      <p v-if="error" style="color: red">{{ error }}</p>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  import { BrowserMultiFormatReader } from '@zxing/browser';
  
  const video = ref(null);
  const result = ref('');
  const error = ref('');
  let codeReader;
  
  onMounted(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
  
      codeReader = new BrowserMultiFormatReader();
  
      const devices = await BrowserMultiFormatReader.listVideoInputDevices();
      const selectedDeviceId = devices[0]?.deviceId;
  
      if (!selectedDeviceId) {
        error.value = 'Nav atrasta kamera.';
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
      error.value = 'Kamera nav pieejama.';
      console.error('Camera access error:', err);
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
  