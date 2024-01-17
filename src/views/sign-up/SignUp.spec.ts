import { render, screen, waitFor } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import SignUp from '@/views/sign-up/SignUp.vue'
import { setupServer } from 'msw/node'
import { HttpResponse, http, type DefaultBodyType } from 'msw'

describe('Sign Up', () => {
  it('has a sign up header', () => {
    render(SignUp)
    const header = screen.getByRole('heading', { name: /sign up/i })
    expect(header).toBeInTheDocument()
  })

  it('has username input', () => {
    render(SignUp)
    expect(screen.getByLabelText('Username')).toBeInTheDocument()
  })

  it('has email input', () => {
    render(SignUp)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('has email type for email input', () => {
    render(SignUp)
    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email')
  })

  it('has password input', () => {
    render(SignUp)
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
  })

  it('has password type for password input', () => {
    render(SignUp)
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password')
  })

  it('has password repeat input', () => {
    render(SignUp)
    expect(screen.getByLabelText('Password Repeat')).toBeInTheDocument()
  })

  it('has password type for password input', () => {
    render(SignUp)
    expect(screen.getByLabelText('Password Repeat')).toHaveAttribute('type', 'password')
  })

  it('has a sign up button', () => {
    render(SignUp)
    const button = screen.getByRole('button', { name: /sign up/i })
    expect(button).toBeInTheDocument()
  })

  it('disables sign up button initially', () => {
    render(SignUp)
    expect(screen.getByRole('button', { name: /sign up/i })).toBeDisabled()
  })

  describe('when user sets same value for password inputs', () => {
    it('enables sign-up button', async () => {
      const user = userEvent.setup()
      render(SignUp)
      const passwordInput = screen.getByLabelText('Password')
      const passwordRepeatInput = screen.getByLabelText('Password Repeat')
      await user.type(passwordInput, 'Password')
      await user.type(passwordRepeatInput, 'Password')
      expect(screen.getByRole('button', { name: /sign up/i })).toBeEnabled()
    })
    describe('when user submits form', () => {
      it('sends username, email, password to backend', async () => {
        let requestBody: DefaultBodyType
        const server = setupServer(
          http.post('/api/v1/users', async ({ request }) => {
            requestBody = await request.json()
            return HttpResponse.json({})
          })
        )
        server.listen()
        const user = userEvent.setup()

        render(SignUp)
        const usernameInput = screen.getByLabelText('Username')
        const emailInput = screen.getByLabelText('Email')
        const passwordInput = screen.getByLabelText('Password')
        const passwordRepeatInput = screen.getByLabelText('Password Repeat')
        await user.type(usernameInput, 'user1')
        await user.type(emailInput, 'user1@mail.com')
        await user.type(passwordInput, 'Password')
        await user.type(passwordRepeatInput, 'Password')
        const button = screen.getByRole('button', { name: /sign up/i })
        await user.click(button)

        await waitFor(() =>
          expect(requestBody).toEqual({
            username: 'user1',
            email: 'user1@mail.com',
            password: 'Password'
          })
        )
        server.close()
      })
    })
  })
})
