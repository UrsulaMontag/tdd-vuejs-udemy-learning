import { createI18n } from 'vue-i18n';
import en from './translations/en.json';
import de from './translations/de.json';

export const i18n = createI18n( {
    legacy: false,
    locale: 'en',
    messages: {
        en,
        de
    }
} );