import { render } from '../../../test/helper';
import { setupServer } from 'msw/node';
import { HttpResponse, http } from 'msw';
import { beforeAll, beforeEach, afterAll } from 'vitest';

let counter = 0;
const server = setupServer(
    http.post( '/api/v1/users', () => {
        counter += 1;
        return HttpResponse.json();
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

    } );
} );