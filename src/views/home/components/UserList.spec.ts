import UserList from './UserList.vue';
import { setupServer } from 'msw/node';
import { HttpResponse, delay, http } from 'msw';
import { render, router, waitFor, screen } from 'test/helper';

const page1 = {
    content: [
        { id: 1, username: 'user1', email: 'user1@mail.com' },
        { id: 2, username: 'user2', email: 'user2@mail.com' },
        { id: 3, username: 'user3', email: 'user3@mail.com' },
        { id: 4, username: 'user4', email: 'user4@mail.com' },
        { id: 5, username: 'user5', email: 'user5@mail.com' }
    ],
    page: 0,
    size: 5,
    totalPages: 5
};

const server = setupServer(
    http.get( '/api/v1/users', () => {
        return HttpResponse.json( page1 );
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
            expect( screen.queryAllByText( /user/ ).length ).toBe( 5 );
        } );
    } );
} )


