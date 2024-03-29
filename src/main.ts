import { createApp } from 'vue';
import { createPinia } from 'pinia';
import './assets/styles.scss';
import { i18n } from './locales';

import App from './App.vue';
import router from './router';

import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:8080';



const app = createApp( App );

app.use( i18n );
app.use( createPinia() );
app.use( router );

app.mount( '#app' );
