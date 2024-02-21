import '@testing-library/jest-dom';
import * as matchers from '@testing-library/jest-dom/matchers';
expect.extend( matchers );

import { i18n } from '@/locales';
import { ref, type WritableComputedRef } from 'vue';
afterEach( () => {
  const locale = ref( 'en' );

  i18n.global.locale = locale as WritableComputedRef<'en' | 'de' | 'en-US'>;
  localStorage.clear();
} );
