import { render } from '@testing-library/vue'
import { i18n } from '../src/locales'

const customRender = (component: any, options?: any) => {
  return render(component, {
    global: {
      plugins: [i18n]
    },
    ...options
  })
}

export * from '@testing-library/vue'
export { customRender as render }
