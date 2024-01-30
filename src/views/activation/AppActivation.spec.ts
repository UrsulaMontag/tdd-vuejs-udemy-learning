import { setupServer } from 'msw/node';
import { HttpResponse, http } from 'msw';
import { beforeAll, beforeEach, afterAll } from 'vitest';
import AppActivation from './AppActivation.vue';
import { render, waitFor } from 'test/helper';

let counter = 0;
const server = setupServer(
    http.patch( '/api/v1/users/:token/aktive', () => {
        counter += 1;
        return HttpResponse.json( {} );
    } )
);

beforeAll( () => server.listen() );
beforeEach( () => {
    counter = 0;
    server.resetHandlers();
} );
afterAll( () => server.close() );
describe( 'Activation', () => {
    it( 'sends activation request to server', async () => {
        render( AppActivation );
        await waitFor( () => expect( counter ).toBe( 1 ) );
    } );
} );