// No need to explicitly define the __mocks__ folder
// because vitest will automatically look for it
vi.mock( '@/views/activation/Appactivation.vue' );
vi.mock( '@/views/home/components/UserList.vue' );
vi.mock( '@/views/user/User.vue' );

import { render, router, screen, waitFor, within } from 'test/helper';
import App from '@/App.vue';
import { vi } from 'vitest';
import { setupServer } from 'msw/node';
import { HttpResponse, http } from 'msw';

let logoutCounter = 0;
const server = setupServer(
  http.post( '/api/v1/auth', () => {
    return HttpResponse.json( { id: 1, username: 'user 1', email: 'user1@mail.com', image: null } );
  } ),
  http.post( '/api/v1/logout', () => {
    logoutCounter += 1;
    return HttpResponse.json( {} );
  } )
);
const setup = async ( path: string ) => {
  router.push( path );
  await router.isReady();
  return render( App );
};

beforeAll( () => server.listen() );
beforeEach( () => {
  logoutCounter = 0;
  server.resetHandlers();
} );
afterAll( () => server.close() );


describe( 'Routing', () => {
  describe.each( [
    { path: '/', pageId: 'home-page' },
    { path: '/activation/123', pageId: 'activation-page' },
    { path: '/activation/456', pageId: 'activation-page' },
    { path: '/password-reset/request', pageId: 'reset-password-request-page' },
    { path: '/password-reset/set', pageId: 'reset-password-set-page' },
    { path: 'signup', pageId: 'sign-up-page' },
    { path: '/login', pageId: 'login-page' },
    { path: '/user/1', pageId: 'user-page' },
    { path: '/user/2', pageId: 'user-page' }
  ] )( 'when path is $path', ( { path, pageId } ) => {
    it( `displays ${ pageId }`, async () => {
      await setup( path );
      const page = screen.getByTestId( pageId );
      expect( page ).toBeInTheDocument();
    } );
  } );

  describe.each( [
    { initialPath: '/', clickingTo: 'link-signup-page', visiblePage: 'sign-up-page' },
    { initialPath: '/signup', clickingTo: 'link-home-page', visiblePage: 'home-page' },
    { initialPath: '/signup', clickingTo: 'link-login-page', visiblePage: 'login-page' },
    { initialPath: '/login', clickingTo: 'link-home-page', visiblePage: 'home-page' },
    { initialPath: '/', clickingTo: 'link-login-page', visiblePage: 'login-page' }
  ] )( 'when path is $initialPath', ( { initialPath, clickingTo, visiblePage } ) => {
    describe( `when user clicks ${ clickingTo }`, () => {
      it( `displays ${ visiblePage } `, async () => {
        const { user } = await setup( initialPath );
        const link: HTMLElement | null = screen.queryByTestId( clickingTo );
        if ( link ) {
          await user.click( link );
          await waitFor( () => {
            expect( screen.queryByTestId( visiblePage ) ).toBeInTheDocument();
          } );
        } else {
          throw new Error( `No element found with test ID ${ clickingTo }` );
        }
      } );
    } );
  } );

  describe( 'when user is at home page', () => {
    describe( 'when user clicks to user name in user list', () => {
      it( 'displays user page', async () => {
        const { user } = await setup( '/' );
        const link = screen.queryByTestId( 'user-item' );
        if ( link ) {
          await user.click( link );
          await waitFor( () => {
            expect( screen.queryByTestId( 'user-page' ) ).toBeInTheDocument();
          } );
        } else {
          throw new Error( `No element found with test ID ${ 'user-item' }` );
        }
      } );
    } );
  } );
  describe( 'when user is at login page', () => {
    describe( 'when user clicks to forgot password link', () => {
      it( 'displays password reset request page', async () => {
        const { user } = await setup( '/login' );
        const link = await screen.findByText( 'Forgot password?' );
        if ( link ) {
          await user.click( link );
          await waitFor( () => {
            expect( screen.queryByTestId( 'reset-password-request-page' ) ).toBeInTheDocument();
          } );
        } else {
          throw new Error( `No element found with text ${ 'forgot-password' }` );
        }
      } );
    } );
  } );

  describe( 'when login is successful', () => {
    it( 'navigates to home page', async () => {
      const { user } = await setup( '/login' );
      await user.type( screen.getByLabelText( 'Email' ), 'user1@mail.com' );
      await user.type( screen.getByLabelText( 'Password' ), 'Password' );
      await user.click( screen.getByRole( 'button', { name: 'Login' } ) );
      await waitFor( () => {
        expect( screen.queryByTestId( 'home-page' ) ).toBeInTheDocument();
      } );
    } );

    const setupLoggedIn = async () => {
      const { user } = await setup( '/login' );
      await user.type( screen.getByLabelText( 'Email' ), 'user1@mail.com' );
      await user.type( screen.getByLabelText( 'Password' ), 'Password' );
      await user.click( screen.getByRole( 'button', { name: 'Login' } ) );
      await screen.findByTestId( 'home-page' );
      return { user };
    };

    it( 'hides login and signup links', async () => {
      await setupLoggedIn(),
        expect( screen.queryByTestId( 'link-login-page' ) ).not.toBeInTheDocument(),
        expect( screen.queryByTestId( 'link-signup-page' ) ).not.toBeInTheDocument();
    } );
    it( 'displays username link on navbar', async () => {
      await setupLoggedIn();
      const profileLink = screen.queryByTestId( 'link-my-profile' );
      expect( profileLink ).toBeInTheDocument();
      expect( profileLink ).toHaveTextContent( 'user 1' );

    } );
    it( 'displays profile img before username on navbar', async () => {
      await setupLoggedIn();
      const profileLink = screen.queryByTestId( 'link-my-profile' );
      const profileImg = within( profileLink! ).queryAllByAltText( 'profile' );
      expect( profileImg ).toBeInTheDocument();

    } );

    describe( 'when user clicks My Profile link', () => {
      it( 'displays user page', async () => {
        const { user } = await setupLoggedIn();
        const link = ( screen.queryByTestId( 'link-my-profile' ) );
        if ( link ) {
          await user.click( link );
        } else {
          throw new Error( `No element found with test ID ${ 'link-my-profile' }` );
        }
        await screen.findByTestId( 'user-page' );
        expect( router.currentRoute.value.path ).toBe( '/user/1' );
      } );
    } );

    it( 'stores logged in state in local storage', async () => {
      await setupLoggedIn();
      const state = JSON.parse( localStorage.getItem( 'auth' ) || '{}' );
      expect( state.id ).toBe( 1 );
      expect( state.username ).toBe( 'user 1' );
    } );
  } );

  describe( 'when local storage has auth data', () => {
    beforeEach( () => {
      localStorage.setItem(
        'auth',
        JSON.stringify( { id: 1, username: 'user1', email: 'user1@mail.com' } ) );
    } );
    it( 'displays logged in layout', async () => {
      await setup( '/' );
      expect( screen.queryByTestId( 'link-signup-page' ) ).not.toBeInTheDocument();
      expect( screen.queryByTestId( 'link-login-page' ) ).not.toBeInTheDocument();
      expect( screen.queryByTestId( 'link-my-profile' ) ).toBeInTheDocument();
    } );

    describe( 'when user clicks logout', () => {
      it( 'displays login and sign up links', async () => {
        const { user } = await setup( '/' );
        await user.click( screen.getByTestId( 'link-logout' ) );
        expect( screen.queryByTestId( 'link-login-page' ) ).toBeInTheDocument();
        expect( screen.queryByTestId( 'link-signup-page' ) ).toBeInTheDocument();
        expect( screen.queryByTestId( 'link-my-profile' ) ).not.toBeInTheDocument();
      } );

      it( 'sends logout request to server', async () => {
        const { user } = await setup( '/' );
        await user.click( screen.queryByTestId( 'link-logout' )! );
        await waitFor( () => {
          expect( logoutCounter ).toBe( 1 );
        } );
      } );
    } );
  } );
} );
