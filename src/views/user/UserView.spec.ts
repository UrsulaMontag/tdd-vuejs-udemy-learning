import { setupServer } from 'msw/node';
import { HttpResponse, delay, http } from 'msw';
import UserView from './UserView.vue';
import { render, router, waitFor, screen } from 'test/helper';
import { i18n } from '@/locales';

let counter = 0;
let id: string | readonly string[] | undefined;
const server = setupServer(
    http.get( '/api/v1/users/:id', async ( { params } ) => {
        counter += 1;
        id = params.id;
        return HttpResponse.json( {
            id: Number( id ),
            username: `user${ id }`,
            email: `user${ id }@mail.com`,
            image: null
        } );
    } )
);
const setup = async ( path: string ) => {
    router.push( path );
    await router.isReady();
    return render( UserView );
};
beforeAll( () => server.listen() );
beforeEach( () => {
    counter = 0;
    id = undefined;
    server.resetHandlers();
} );
afterAll( () => server.close() );

describe( 'User page', () => {
    let resolveFunc: ( value?: unknown ) => void;
    it.only( 'sends fetch request to server', async () => {
        await setup( '/' );
        await waitFor( () => expect( counter ).toBe( 1 ) );
    } );

    describe.each( [ { userId: '125' }, { userId: '269' } ] )( 'when id is $userId', ( { userId } ) => {
        it.only( 'sends id in request', async () => {
            await setup( `/user/${ userId }` );
            await waitFor( () => {
                expect( id ).toBe( userId );
            } );
        } );
    } );

    describe( 'when id is changed', () => {
        it.only( 'sends request with new id', async () => {
            await setup( '/user/123' );
            await waitFor( () => {
                expect( id ).toBe( '123' );
            } );
            router.push( '/user/456' );
            await waitFor( () => {
                expect( id ).toBe( '456' );
            } );
        } );
    } );

    describe( 'when network failure occurs', () => {
        it.only( 'displays generic message', async () => {
            server.use(
                //@ts-ignore next-line
                http.get( '/api/v1/users/:id', ( req, res, ctx ) => {
                    return res( ctx.networkError( 'Failed to connect' ) );
                } )
            );
            await setup( '/user/1' );
            const text = await screen.findByText( 'Unexpected error occured. Please try again.' );
            expect( text ).toBeInTheDocument();
        } );
    } );

    describe( 'when user not found', () => {
        it.only( 'displays error message received in response', async () => {
            const promise = new Promise( ( resolve ) => {
                resolveFunc = resolve;
            } );
            server.use(
                http.get( `/api/v1/users/:id`, async () => {
                    await promise;
                    return HttpResponse.json( { message: 'User not found' }, { status: 404 } );
                } )
            );
            await setup( '/user/1' );
            expect( screen.queryByText( 'User not found' ) ).not.toBeInTheDocument();
            await resolveFunc();
            await waitFor( () => {
                expect( screen.getByText( 'User not found' ) ).toBeInTheDocument();
            } );
        } );
    } );

    describe( 'when user is found', () => {
        it.only( 'displays username on userpage', async () => {
            const promise = new Promise( ( resolve ) => {
                resolveFunc = resolve;
            } );
            server.use(
                http.get( '/api/v1/user/:id', async () => {
                    await promise;
                    return HttpResponse.json( {
                        id: 1,
                        username: 'user1',
                        email: 'user1@mail.com',
                        image: null
                    } );
                } )
            );
            await setup( '/user/1' );
            expect( screen.queryByText( /user1/i ) ).not.toBeInTheDocument();
            await resolveFunc();
            await waitFor( () => {
                expect( screen.queryByText( /user1/i ) ).toBeInTheDocument();
            } );
        } );
    } );

    it.only( 'displays spinner', async () => {
        const promise = new Promise( ( resolve ) => {
            resolveFunc = resolve;
        } );
        server.use(
            http.get( '/api/v1/users/:id', async () => {
                await promise;
                return HttpResponse.json();
            } )
        );
        await setup( '/user/123' );
        const spinner = await screen.findByRole( 'status' );
        expect( spinner ).toBeInTheDocument();
        await resolveFunc();
        await waitFor( () => {
            expect( spinner ).not.toBeInTheDocument();
        } );
    } );

    describe.each( [ { language: 'de' }, { language: 'en' } ] )(
        'when langauge is $language',
        ( { language } ) => {
            it.only( 'sends expected language in accept language header', async () => {
                i18n.global.locale.value = language as "en" | "en-US" | "de";
                let acceptLanguage: string | null;
                server.use(
                    http.get( '/api/v1/users/:id', async ( { request } ) => {
                        acceptLanguage = request.headers.get( 'Accept-Language' );
                        await delay( 'infinite' );
                        return HttpResponse.json( {} );
                    } )
                );
                await setup( '/user/123' );
                await waitFor( () => {
                    expect( acceptLanguage ).toBe( language );
                } );
            } );
        }
    );
} );