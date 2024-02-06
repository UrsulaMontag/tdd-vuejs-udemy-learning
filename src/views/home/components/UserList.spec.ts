import UserList from './UserList.vue';
import { setupServer } from 'msw/node';
import { HttpResponse, http } from 'msw';
import { render, waitFor, screen } from 'test/helper';

let resolveFunc: ( value?: unknown ) => void;

const users = [
    { id: 1, username: 'user1', email: 'user1@mail.com' },
    { id: 2, username: 'user2', email: 'user2@mail.com' },
    { id: 3, username: 'user3', email: 'user3@mail.com' },
    { id: 4, username: 'user4', email: 'user4@mail.com' },
    { id: 5, username: 'user5', email: 'user5@mail.com' },
    { id: 6, username: 'user6', email: 'user6@mail.com' },
    { id: 7, username: 'user7', email: 'user7@mail.com' },
];

const getPage = ( page: number, size: number ) => {
    const start = page * size;
    const end = start + size;
    const totalPages = Math.ceil( users.length / size );
    return { content: users.slice( start, end ), page, size, totalPages };
};

const server = setupServer(
    http.get( '/api/v1/users', ( { request } ) => {
        const url = new URL( request.url );
        const size = Number.parseInt( url.searchParams.get( 'size' ) || '3' );
        const page = Number.parseInt( url.searchParams.get( 'page' ) || '0' );

        return HttpResponse.json( getPage( page, size ) );
    } )
);

beforeAll( () => server.listen() );
beforeEach( () => {

    server.resetHandlers();
} );
afterAll( () => server.close() );

describe( 'User list', () => {
    it( 'displays five users in list', async () => {
        render( UserList );
        await waitFor( () => {
            expect( screen.queryAllByText( /user/ ).length ).toBe( 3 );
        } );
    } );

    it( 'displays spinner', async () => {
        const promise = new Promise( ( resolve ) => {
            resolveFunc = resolve;
        } );
        server.use(
            http.get( '/api/v1/users', async () => {
                await promise;
                return HttpResponse.json( getPage( 0, 3 ) );
            } )
        );
        render( UserList );
        await waitFor( () => {
            expect( screen.queryByRole( 'status' ) ).toBeInTheDocument();
        } );
        await resolveFunc();
        await waitFor( () => {
            expect( screen.queryByRole( 'status' ) ).not.toBeInTheDocument();
        } );
    } );

    it( 'displays next page button', async () => {
        render( UserList );
        await screen.findByText( 'user1' );
        expect( screen.queryByRole( 'button', { name: 'Next' } ) ).toBeInTheDocument();
    } );
    it( 'does not display previous page button', async () => {
        render( UserList );
        await screen.findByText( 'user1' );
        expect( screen.queryByRole( 'button', { name: 'Previous' } ) ).not.toBeInTheDocument();
    } );

    describe( 'when user clicks next button', () => {
        it( 'displays next page of users', async () => {
            const { user } = render( UserList );
            await screen.findByText( 'user1' );
            await user.click( screen.getByRole( 'button', { name: 'Next' } ) );
            const firstUserOnPage2 = await screen.findByText( 'user4' );
            expect( firstUserOnPage2 ).toBeInTheDocument();
        } );
        it( 'displays previous page button', async () => {
            const { user } = render( UserList );
            await screen.findByText( 'user1' );
            await user.click( screen.getByRole( 'button', { name: 'Next' } ) );
            await screen.findByText( 'user4' );
            expect( screen.queryByRole( 'button', { name: 'Previous' } ) ).toBeInTheDocument();
        } );

        describe( 'when user clicks previous button', () => {
            it( 'displays previous page of users', async () => {
                const { user } = render( UserList );
                await screen.findByText( 'user1' );
                await user.click( screen.getByRole( 'button', { name: 'Next' } ) );
                await screen.findByText( 'user4' );
                await user.click( screen.getByRole( 'button', { name: 'Previous' } ) );
                const firstUserOnPage1 = await screen.findByText( 'user1' );
                expect( firstUserOnPage1 ).toBeInTheDocument();
            } );
        } );
        describe( 'when last page is loaded', () => {
            it( 'does not display next page button', async () => {
                const { user } = render( UserList );
                await screen.findByText( 'user1' );
                await user.click( screen.getByRole( 'button', { name: 'Next' } ) );
                await screen.findByText( 'user4' );
                await user.click( screen.getByRole( 'button', { name: 'Next' } ) );
                await screen.findByText( 'user7' );
                expect( screen.queryByRole( 'button', { name: 'Next' } ) ).not.toBeInTheDocument();
            } );
        } );
    } );
} )


