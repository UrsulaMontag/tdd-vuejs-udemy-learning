import { render, screen } from '@testing-library/vue'
import SignUp from './SignUp.vue'

describe('Sign Up', () => {
  it('has a sign up header', () => {
    render(SignUp)
    const header = screen.getByRole('heading', { name: /sign up/i })
    expect(header).toBeInTheDocument()
  })
})
