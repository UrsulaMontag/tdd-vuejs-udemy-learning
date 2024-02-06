
// No need to explicitly define the __mocks__ folder 
// because vitest will automatically look for it
vi.mock( '@/views/activation/Appactivation.vue' );
vi.mock( '@/views/home/components/UserList.vue' );

import { render, router, screen, waitFor } from 'test/helper';
import App from '@/App.vue';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

const setup = async ( path: string ) => {
  router.push( path );
  await router.isReady();
  render( App );
};
describe( 'Routing', () => {
  describe.each( [
    { path: '/', pageId: 'home-page' },
    { path: '/activation/123', pageId: 'activation-page' },
    { path: '/activation/456', pageId: 'activation-page' },
    { path: 'signup', pageId: 'sign-up-page' }
  ] )( 'when path is $path', ( { path, pageId } ) => {
    it( `displays ${ pageId }`, async () => {
      await setup( path );
      const page = screen.getByTestId( pageId );
      expect( page ).toBeInTheDocument();
    } );
  } );

  describe.each( [ { initialPath: '/', clickingTo: 'link-signup-page', visiblePage: 'sign-up-page' }, { initialPath: '/signup', clickingTo: 'link-home-page', visiblePage: 'home-page' } ] )( 'when path is $initialPath', ( { initialPath, clickingTo, visiblePage } ) => {
    describe( `when user clicks ${ clickingTo }`, () => {
      it( `displays ${ visiblePage } `, async () => {
        await setup( initialPath );
        const link: HTMLElement | null = screen.queryByTestId( clickingTo );
        if ( link ) {
          await userEvent.click( link );
          await waitFor( () => {
            expect( screen.queryByTestId( visiblePage ) ).toBeInTheDocument();
          } );
        } else {
          throw new Error( `No element found with test ID ${ clickingTo }` );
        }
      } );
    } );
  } );
} );
