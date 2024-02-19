import '@testing-library/jest-dom';
import * as matchers from '@testing-library/jest-dom/matchers';
expect.extend( matchers );

import { i18n } from '@/locales';
import { ref, type WritableComputedRef, type Ref } from 'vue';
afterEach( () => {
  // Create a ref with the initial value 'en'
  const locale: Ref<'en' | 'de' | 'en-US'> = ref( 'en' );

  i18n.global.locale = locale as WritableComputedRef<'en' | 'de' | 'en-US'>;
  localStorage.clear();
} );
