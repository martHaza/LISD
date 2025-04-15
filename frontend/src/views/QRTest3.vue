<template>
    <div>
        <div id="reader" style="width: 100%"></div>
        <p v-if="scannedCode">Skenēšanas rezultāts: {{ scannedCode }}</p>
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

const scannedCode = ref(null)
const scannerRunning = ref(false)
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
      (decodedText, decodedResult) => {
        scannedCode.value = decodedText
        console.log("Decoded:", decodedText, decodedResult)
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
  