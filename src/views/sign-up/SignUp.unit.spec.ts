vi.hoisted(() => vi.resetModules())

vi.mock('vue-i18n')

import { render, screen, waitFor } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import SignUp from '@/views/sign-up/SignUp.vue'
import { vi } from 'vitest'
import axios, { type AxiosStatic } from 'axios'
import { useI18n, type Composer } from 'vue-i18n'
import en from '@/locales/translations/en.json'

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

const mockI18n: Partial<Composer> = {
  t: (key: string) => en[key as keyof typeof en]
}

vi.mocked(useI18n).mockReturnValue(mockI18n as Composer)
type ElementKeys =
  | 'button'
  | 'passwordInput'
  | 'passwordRepeatInput'
  | 'usernameInput'
  | 'emailInput'
type Elements = Record<ElementKeys, HTMLElement>

const setup = async () => {
  const user = userEvent.setup()

  const result = render(SignUp, {
    global: {
      mocks: {
        $t: (key: string) => {
          return en[key as keyof typeof en]
        }
      }
    }
  })
  const usernameInput = screen.getByLabelText('Username')
  const emailInput = screen.getByLabelText('Email')
  const passwordInput = screen.getByLabelText('Password')
  const passwordRepeatInput = screen.getByLabelText('Password Repeat')
  await user.type(usernameInput, 'user1')
  await user.type(emailInput, 'user123@mail.com')
  await user.type(passwordInput, 'Password1')
  await user.type(passwordRepeatInput, 'Password1')
  const button = screen.getByRole('button', { name: /sign up/i })
  return {
    ...result,
    user,
    elements: { button, usernameInput, emailInput, passwordInput, passwordRepeatInput }
  }
}
//when use mocks in tests, we have to take care of clearing mocks before each test, that the tests do not effect each other
beforeEach(() => {
  vi.clearAllMocks()
})

describe('Sign Up', () => {
  describe('when user sets same value for password inputs', () => {
    describe('when user submits form', () => {
      it('sends username, email, password to backend', async () => {
        vi.mocked(axios.post).mockResolvedValue({ data: {} })
        const {
          user,
          elements: { button }
        } = await setup()
        await user.click(button)
        expect(axios.post).toHaveBeenCalledWith('/api/v1/users', {
          username: 'user1',
          email: 'user123@mail.com',
          password: 'Password1'
        })
      })
      describe('when there is an ongoing api call', () => {
        it('does not allow clicking the button', async () => {
          vi.mocked(axios.post).mockImplementation(
            () =>
              new Promise((resolve) => {
                setTimeout(() => resolve({ data: {} }), 1000)
              })
          )
          const {
            user,
            elements: { button }
          } = await setup()
          await user.click(button)
          await user.click(button)

          expect(axios.post).toHaveBeenCalledTimes(1)
        })
        it('displays spinner', async () => {
          vi.mocked(axios.post).mockImplementation(
            () =>
              new Promise((resolve) => {
                setTimeout(() => resolve({ data: {} }), 1000)
              })
          )
          const {
            user,
            elements: { button }
          } = await setup()
          await user.click(button)
          expect(screen.getByRole('status')).toBeInTheDocument()
        })
      })
      describe('when success response is received', () => {
        beforeEach(() => {
          vi.mocked(axios.post).mockResolvedValue({
            data: { message: 'User created successfully' }
          })
        })
        it('displays success message received from backend', async () => {
          const {
            user,
            elements: { button }
          } = await setup()
          await user.click(button)
          const text = await screen.findByText('User created successfully')
          expect(text).toBeInTheDocument()
        })
        it('hides sign up form', async () => {
          const {
            user,
            elements: { button }
          } = await setup()
          const form = screen.getByTestId('form-sign-up')
          await user.click(button)
          await waitFor(() => expect(form).not.toBeInTheDocument())
        })
      })
      describe('when network failure occurs', () => {
        beforeEach(() => {
          vi.mocked(axios.post).mockRejectedValue({})
        })
        it('displays generic message', async () => {
          const {
            user,
            elements: { button }
          } = await setup()
          await user.click(button)
          const text = await screen.findByText('Unexpected error occured. Please try again.')
          expect(text).toBeInTheDocument()
        })
        it('hides spinner', async () => {
          const {
            user,
            elements: { button }
          } = await setup()
          await user.click(button)
          await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument())
        })

        describe('when user submits form again', () => {
          it('hides error message when api request is in progress', async () => {
            vi.mocked(axios.post).mockRejectedValueOnce({}).mockResolvedValue({
              data: {}
            })
            const {
              user,
              elements: { button }
            } = await setup()
            await user.click(button)
            const text = await screen.findByText('Unexpected error occured. Please try again.')
            await user.click(button)
            await waitFor(() => expect(text).not.toBeInTheDocument())
          })
        })
      })

      describe.each([
        { field: 'username', message: 'Username cannot be null' },
        { field: 'email', message: 'E-mail cannot be null' },
        { field: 'password', message: 'Password must be at least 6 characters' }
      ])('when $field is invalid', ({ field, message }) => {
        it(`displays ${message}`, async () => {
          vi.mocked(axios.post).mockRejectedValue({
            response: {
              status: 400,
              data: {
                validationErrors: {
                  [field]: message
                }
              }
            }
          })
          const setupResult = await setup()
          const elements: Elements = setupResult.elements
          const user = setupResult.user
          await user.click(elements.button)
          const error = await screen.findByText(message)
          expect(error).toBeInTheDocument()
        })
        it(`clears validation error when user changes ${field}`, async () => {
          vi.mocked(axios.post).mockRejectedValue({
            response: {
              status: 400,
              data: {
                validationErrors: {
                  [field]: message
                }
              }
            }
          })

          const setupResult = await setup()
          const elements: Elements = setupResult.elements
          const user = setupResult.user
          await user.click(elements.button)
          await user.type(elements[`${field}Input` as ElementKeys], 'updated')
          expect(screen.queryByText(message)).not.toBeInTheDocument()
        })
      })
    })
  })
})
