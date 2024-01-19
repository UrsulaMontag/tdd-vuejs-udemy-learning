vi.mock( 'axios' );

import { render, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import SignUp from '@/views/sign-up/SignUp.vue';
import { vi } from 'vitest';
import axios from 'axios';

const setup = async () => {
  const user = userEvent.setup();

  const result = render( SignUp );
  const usernameInput = screen.getByLabelText( 'Username' );
  const emailInput = screen.getByLabelText( 'Email' );
  const passwordInput = screen.getByLabelText( 'Password' );
  const passwordRepeatInput = screen.getByLabelText( 'Password Repeat' );
  await user.type( usernameInput, 'user1' );
  await user.type( emailInput, 'user123@mail.com' );
  await user.type( passwordInput, 'Password1' );
  await user.type( passwordRepeatInput, 'Password1' );
  const button = screen.getByRole( 'button', { name: /sign up/i } );
  return {
    ...result,
    user,
    elements: { button }
  };
};
//when use mocks in tests, we have to take care of clearing mocks before each test, that the tests do not effect each other
beforeEach( () => {
  vi.clearAllMocks();
} );

describe( 'Sign Up', () => {
  describe( 'when user sets same value for password inputs', () => {
    describe( 'when user submits form', () => {
      it( 'sends username, email, password to backend', async () => {
        const {
          user,
          elements: { button }
        } = await setup();
        await user.click( button );
        expect( axios.post ).toHaveBeenCalledWith( '/api/v1/users', {
          username: 'user1',
          email: 'user123@mail.com',
          password: 'Password1'
        } );
      } );
      describe( 'when there is an ongoing api call', () => {
        it( 'does not allow clicking the button', async () => {
          const {
            user,
            elements: { button }
          } = await setup();
          await user.click( button );
          await user.click( button );

          expect( axios.post ).toHaveBeenCalledTimes( 1 );
        } );
      } );
    } );
  } );
} );
