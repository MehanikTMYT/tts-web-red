import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';

// Инициализация Pinia (если используется)
const pinia = createPinia();
const app = createApp(App);

// Подключение Pinia и Vue Router
app.use(pinia);
app.use(router);

// Монтирование приложения
app.mount('#app');