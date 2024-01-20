import { render, screen, waitFor } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import SignUp from '@/views/sign-up/SignUp.vue';
import { vi } from 'vitest';
import axios from 'axios';

vi.mock( 'axios', () => {
  return {
    default: {
      post: vi.fn()
    }
  };
} );

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
        vi.mocked( axios.post ).mockResolvedValue( { data: {} } );
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
          vi.mocked( axios.post ).mockImplementation(
            () =>
              new Promise( ( resolve ) => {
                setTimeout( () => resolve( { data: {} } ), 1000 );
              } )
          );
          const {
            user,
            elements: { button }
          } = await setup();
          await user.click( button );
          await user.click( button );

          expect( axios.post ).toHaveBeenCalledTimes( 1 );
        } );
        it( 'displays spinner', async () => {
          vi.mocked( axios.post ).mockImplementation(
            () =>
              new Promise( ( resolve ) => {
                setTimeout( () => resolve( { data: {} } ), 1000 );
              } )
          );
          const {
            user,
            elements: { button }
          } = await setup();
          await user.click( button );
          expect( screen.getByRole( 'status' ) ).toBeInTheDocument();
        } );
      } );
      describe( 'when success response is received', () => {
        beforeEach( () => {
          vi.mocked( axios.post ).mockResolvedValue( {
            data: { message: 'User created successfully' }
          } );
        } );
        it( 'displays success message received from backend', async () => {
          const {
            user,
            elements: { button }
          } = await setup();
          await user.click( button );
          const text = await screen.findByText( 'User created successfully' );
          expect( text ).toBeInTheDocument();
        } );
        it( 'hides sign up form', async () => {
          const {
            user,
            elements: { button }
          } = await setup();
          const form = screen.getByTestId( 'form-sign-up' );
          await user.click( button );
          await waitFor( () => expect( form ).not.toBeInTheDocument() );
        } );
      } );
      describe( 'when network failure occurs', () => {
        beforeEach( () => {
          vi.mocked( axios.post ).mockRejectedValue( {} );
        } );
        it( 'displays generic message', async () => {
          const {
            user,
            elements: { button }
          } = await setup();
          await user.click( button );
          const text = await screen.findByText( 'Unexpected error occured. Please try again.' );
          expect( text ).toBeInTheDocument();
        } );
        it( 'hides spinner', async () => {
          const {
            user,
            elements: { button }
          } = await setup();
          await user.click( button );
          await waitFor( () => expect( screen.queryByRole( 'status' ) ).not.toBeInTheDocument() );
        } );

        describe( 'when user submits form again', () => {
          it( 'hides error message when api request is in progress', async () => {
            vi.mocked( axios.post ).mockRejectedValueOnce( {} ).mockResolvedValue( {
              data: {}
            } );
            const {
              user,
              elements: { button }
            } = await setup();
            await user.click( button );
            const text = await screen.findByText( 'Unexpected error occured. Please try again.' );
            await user.click( button );
            await waitFor( () => expect( text ).not.toBeInTheDocument() );
          } );
        } );
      } );

      describe( 'when username is invalid', () => {
        it( 'displays validation error', async () => {
          vi.mocked( axios.post ).mockRejectedValue( {
            response: {
              status: 400,
              data: {
                validationErrors: {
                  username: 'Username cannot be null'
                }
              }
            }
          } );
          const { user, elements: { button } } = await setup();
          await user.click( button );
          const error = await screen.findByText( "Username cannot be null" );
          expect( error ).toBeInTheDocument();
        } );
      } );
    } );
  } );
} );
