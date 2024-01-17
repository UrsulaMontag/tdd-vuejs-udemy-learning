vi.mock('axios')

import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import SignUp from '@/views/sign-up/SignUp.vue'
import { vi } from 'vitest'
import axios from 'axios'

describe('Sign Up', () => {
  describe('when user sets same value for password inputs', () => {
    describe('when user submits form', () => {
      it('sends username, email, password to backend', async () => {
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
        expect(axios.post).toHaveBeenCalledWith('/api/v1/users', {
          username: 'user1',
          email: 'user1@mail.com',
          password: 'Password'
        })
      })
    })
  })
})
