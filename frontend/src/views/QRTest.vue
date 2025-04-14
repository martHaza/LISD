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
    await navigator.mediaDevices.getUserMedia({ video: true });
    codeReader = new BrowserMultiFormatReader();

    try {
        // first try using back camera
        await codeReader.decodeFromConstraints(
            {
            video: {
                facingMode: { ideal: 'environment' },
            },
            },
            video.value,
            (res, err) => {
            if (res) {
                result.value = res.getText();
                // codeReader.reset();
            }
            }
    );
    } catch (e) {
        // if no back camera use default camera
        const devices = await BrowserMultiFormatReader.listVideoInputDevices();
        const firstDevice = devices[0]?.deviceId;

        if (firstDevice) {
            await codeReader.decodeFromVideoDevice(
            firstDevice,
            video.value,
            (res, err) => {
                if (res) {
                result.value = res.getText();
                // codeReader.reset();
                }
            }
            );
        } else {
            console.error('No video input devices found.');
        }
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
  