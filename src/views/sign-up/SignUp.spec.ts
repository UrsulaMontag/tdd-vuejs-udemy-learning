import { render, screen, waitFor } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import SignUp from '@/views/sign-up/SignUp.vue';
import { setupServer } from 'msw/node';
import { HttpResponse, http, type DefaultBodyType, delay } from 'msw';
import { afterAll } from 'vitest';

let requestBody: DefaultBodyType;
let counter = 0;
const server = setupServer(
  http.post( '/api/v1/users', async ( { request } ) => {
    requestBody = await request.json();
    counter += 1;
    return HttpResponse.json( { message: 'User created successfully' } );
  } )
);

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
    elements: { button, passwordInput, passwordRepeatInput, usernameInput, emailInput }
  };
};

beforeAll( () => server.listen() );
afterAll( () => server.close() );
beforeEach( () => {
  counter = 0;
  server.resetHandlers();
} );

describe( 'Sign Up', () => {
  it( 'has a sign up header', () => {
    render( SignUp );
    const header = screen.getByRole( 'heading', { name: /sign up/i } );
    expect( header ).toBeInTheDocument();
  } );

  it( 'has username input', () => {
    render( SignUp );
    expect( screen.getByLabelText( 'Username' ) ).toBeInTheDocument();
  } );

  it( 'has email input', () => {
    render( SignUp );
    expect( screen.getByLabelText( 'Email' ) ).toBeInTheDocument();
  } );

  it( 'has email type for email input', () => {
    render( SignUp );
    expect( screen.getByLabelText( 'Email' ) ).toHaveAttribute( 'type', 'email' );
  } );

  it( 'has password input', () => {
    render( SignUp );
    expect( screen.getByLabelText( 'Password' ) ).toBeInTheDocument();
  } );

  it( 'has password type for password input', () => {
    render( SignUp );
    expect( screen.getByLabelText( 'Password' ) ).toHaveAttribute( 'type', 'password' );
  } );

  it( 'has password repeat input', () => {
    render( SignUp );
    expect( screen.getByLabelText( 'Password Repeat' ) ).toBeInTheDocument();
  } );

  it( 'has password type for password input', () => {
    render( SignUp );
    expect( screen.getByLabelText( 'Password Repeat' ) ).toHaveAttribute( 'type', 'password' );
  } );

  it( 'has a sign up button', () => {
    render( SignUp );
    const button = screen.getByRole( 'button', { name: /sign up/i } );
    expect( button ).toBeInTheDocument();
  } );

  it( 'disables sign up button initially', () => {
    render( SignUp );
    expect( screen.getByRole( 'button', { name: /sign up/i } ) ).toBeDisabled();
  } );
  it( 'does not display spinner', () => {
    render( SignUp );
    expect( screen.queryByRole( 'status' ) ).not.toBeInTheDocument();
  } );

  describe( 'when passwords do not match', () => {
    it( 'displays error', async () => {
      const { user, elements: { passwordInput, passwordRepeatInput } } = await setup();
      await user.type( passwordInput, 'Password1' );
      await user.type( passwordRepeatInput, 'Password2' );
      expect( screen.getByText( 'Password mismatch' ) ).toBeInTheDocument();
    } );
  } );

  describe( 'when user sets same value for password inputs', () => {
    it( 'enables sign-up button', async () => {
      const {
        elements: { button }
      } = await setup();
      expect( button ).toBeEnabled();
    } );
    describe( 'when user submits form', () => {
      it( 'sends username, email, password to backend', async () => {
        const {
          user,
          elements: { button }
        } = await setup();
        await user.click( button );
        await waitFor( () =>
          expect( requestBody ).toEqual( {
            username: 'user1',
            email: 'user123@mail.com',
            password: 'Password1'
          } )
        );
      } );
      describe( 'when there is an ongoing api call', () => {
        it( 'does not allow clicking the button', async () => {
          const {
            user,
            elements: { button }
          } = await setup();
          await user.click( button );
          await user.click( button );
          await waitFor( () => expect( counter ).toBe( 1 ) );
        } );
        it( 'displays spinner', async () => {
          server.use(
            http.post( '/api/v1/users', async () => {
              await delay( 'infinite' );
              return HttpResponse.json( {} );
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
        it( 'displays generic message', async () => {
          server.use(
            http.post( 'api/v1/users', () => {
              return HttpResponse.error();
            } )
          );
          const {
            user,
            elements: { button }
          } = await setup();
          await user.click( button );
          const text = await screen.findByText( 'Unexpected error occured. Please try again.' );
          expect( text ).toBeInTheDocument();
        } );
        it( 'hides spinner', async () => {
          server.use(
            http.post( 'api/v1/users', () => {
              return HttpResponse.error();
            } )
          );
          const {
            user,
            elements: { button }
          } = await setup();
          await user.click( button );
          await waitFor( () => expect( screen.queryByRole( 'status' ) ).not.toBeInTheDocument() );
        } );

        describe( 'when user submits form again', () => {
          it( 'hides error message when api request is in progress', async () => {
            let processedFirstRequest = false;
            server.use(
              http.post( 'api/v1/users', async () => {
                if ( !processedFirstRequest ) {
                  processedFirstRequest = true;
                  return HttpResponse.error();
                }
                return HttpResponse.json( {} );
              } )
            );
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

      describe.each( [
        { field: 'username', message: "Username cannot be null" },
        { field: 'email', message: 'Email cannot be null' },
        { field: 'password', message: "Password cannot be null" }
      ] )( 'when $field is invalid', ( { field, message } ) => {
        it( `displays ${ message }`, async () => {
          server.use(
            http.post( '/api/v1/users', async () => {
              return HttpResponse.json(
                {
                  validationErrors: {
                    [ field ]: message
                  }
                },
                { status: 400 }
              );
            } )
          );
          const {
            user,
            elements: { button }
          } = await setup();
          await user.click( button );
          const error = await screen.findByText( message );
          await waitFor( () => {
            expect( error ).toBeInTheDocument();
          } );
        } );

        it( 'clears validation error when user changes the value', async () => {
          server.use(
            http.post( '/api/v1/users', async () => {
              return HttpResponse.json(
                {
                  validationErrors: {
                    [ field ]: message
                  }
                },
                { status: 400 }
              );
            } )
          );

          type ElementKeys = 'button' | 'passwordInput' | 'passwordRepeatInput' | 'usernameInput' | 'emailInput';
          type Elements = Record<ElementKeys, HTMLElement>;

          const setupResult = await setup();
          const elements: Elements = setupResult.elements;
          const user = setupResult.user;
          await user.click( elements.button );
          const error = await screen.findByText( message );
          await user.type( elements[ `${ field }Input` as ElementKeys ], 'updated' );
          expect( error ).not.toBeInTheDocument();
        } );
      } );
    } );
  } );
} );
