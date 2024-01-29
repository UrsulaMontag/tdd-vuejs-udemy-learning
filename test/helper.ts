import { render } from '@testing-library/vue'
import { i18n } from '../src/locales'
import userEvent from '@testing-library/user-event'
import router from '@/router'

const customRender = (component: any, options?: any) => {
  const user = userEvent.setup()
  const result = render(component, {
    global: {
      plugins: [i18n, router]
    },
    ...options
  })
  return { result, user }
}

export * from '@testing-library/vue'
export { customRender as render }
export { router }
