<template>
    <div>
      <div id="reader" style="width: 100%"></div>
  
      <p v-if="scannedCode">Skenēšanas rezultāts: {{ scannedCode }}</p>
  
      <div v-if="itemData" style="margin-top: 1em">
        <p><strong>Inventāra numurs:</strong> {{ itemData.item_number || '-' }}</p>
        <p><strong>Nosaukums:</strong> {{ itemData.title || '-' }}</p>
        <p><strong>Mat. atb. persona:</strong> {{ itemData.email || '-' }}</p>
      </div>
  
      <button @click="stopScanner" v-if="scannerRunning">Beigt skenēšanu</button>
    </div>
  </template>
  
  <script setup>
  import { onMounted, onBeforeUnmount, ref } from 'vue'
  import {
    Html5Qrcode,
    Html5QrcodeScanType,
    Html5QrcodeSupportedFormats
  } from 'html5-qrcode'
  import axios from 'axios'
  
  const scannedCode = ref(null)
  const scannerRunning = ref(false)
  const itemData = ref(null)
  
  let html5QrCode = null
  const qrRegionId = "reader"
  
  const startScanner = async () => {
    try {
      html5QrCode = new Html5Qrcode(qrRegionId)
  
      const config = {
        fps: 10,
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        formatsToSupport: [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E
        ]
      }
  
      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        async (decodedText, decodedResult) => {
          scannedCode.value = decodedText
          console.log("Decoded:", decodedText, decodedResult)
  
          try {
            const { data } = await axios.get(`/api/items/item_number/${decodedText}`)
            itemData.value = data
          } catch (err) {
            if (err.response?.status === 404) {
              itemData.value = null
            } else {
              console.error("Server error:", err)
            }
          }
        },
        (errorMessage) => {
          console.warn("Scan error:", errorMessage)
        }
      )
  
      scannerRunning.value = true
    } catch (err) {
      console.error("Failed to start scanner", err)
    }
  }
  
  const stopScanner = async () => {
    if (html5QrCode && scannerRunning.value) {
      await html5QrCode.stop()
      html5QrCode.clear()
      scannerRunning.value = false
    }
  }
  
  onMounted(() => {
    startScanner()
  })
  
  onBeforeUnmount(() => {
    stopScanner()
  })
  </script>
  