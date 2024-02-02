import axios from "axios";
import { i18n } from "../locales";

const http = axios.create();

http.interceptors.request.use( ( config ) => {
    config.headers[ 'Accept-Language' ] = i18n.global.locale.value;
    return config;
} );

export default http;