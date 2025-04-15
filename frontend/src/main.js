import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from "./router";
import { createPinia } from "pinia";
import { registerSW } from 'virtual:pwa-register'

import { QrcodeStream, QrcodeDropZone, QrcodeCapture } from 'vue-qrcode-reader';

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.component('QrcodeStream', QrcodeStream);
app.component('QrcodeDropZone', QrcodeDropZone);
app.component('QrcodeCapture', QrcodeCapture);

app.mount("#app");

registerSW({
    immediate: true,
    onOfflineReady() {
        console.log('PWA is ready to work offline.')
    },
    onNeedRefresh() {
        window.location.reload()
    },
})