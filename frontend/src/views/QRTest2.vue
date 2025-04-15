<template>
    <div>
      <qrcode-stream
        :formatsToSupport="['qr_code', 'code_128', 'ean_13', 'upc_a']"
        :constraints="{ facingMode: { ideal: 'environment' } }"
        @decode="onDecode"
        @init="onInit"
      />
      <p v-if="result">Skenēšanas rezultāts: {{ result }}</p>
      <p v-if="error" style="color: red;">Error: {{ error }}</p>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { QrcodeStream } from 'vue-qrcode-reader'
  
  const result = ref('')
  const error = ref('')
  
  function onDecode(data) {
    result.value = data
    console.log("Scanned code:", data)
  }
  
  function onInit(promise) {
    promise.catch(err => {
      error.value = err.message
      console.error("Camera error:", err)
    })
  }
  </script>
  