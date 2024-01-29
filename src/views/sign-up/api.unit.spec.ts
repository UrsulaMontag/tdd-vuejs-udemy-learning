vi.hoisted(() => vi.resetModules())

vi.mock('axios', async (importOriginal) => {
  const actual: AxiosStatic = await importOriginal()
  return {
    ...actual,
    default: {
      ...actual.defaults,
      post: vi.fn()
    }
  }
})
vi.mock('@/locales', () => ({
  i18n: {
    global: {
      locale: { value: 'ab' }
    }
  }
}))
import { vi } from 'vitest'
import axios, { type AxiosStatic } from 'axios'
import { signUp } from './api'

describe('signUp', () => {
  it('calls axios with expected parameters', () => {
    const body = { key: 'value' }
    signUp(body)
    expect(vi.mocked(axios.post)).toHaveBeenCalledWith('/api/v1/users', body, {
      headers: { 'Accept-Language': 'ab' }
    })
  })
})
