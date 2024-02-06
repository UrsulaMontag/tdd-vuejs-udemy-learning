import { setupServer } from 'msw/node';
import { HttpResponse, delay, http } from 'msw';
import AppActivation from './AppActivation.vue';
import { render, router, waitFor, screen } from 'test/helper';
import { i18n } from '@/locales';

let counter = 0;
let token: string | readonly string[] | undefined;
const server = setupServer(
    http.patch( '/api/v1/users/:token/active', ( { params } ) => {
        counter += 1;
        token = params.token;
        return HttpResponse.json( {} );
    } )
);
const setup = async ( path: string ) => {
    router.push( path );
    await router.isReady();
    return render( AppActivation );
};

beforeAll( () => server.listen() );
beforeEach( () => {
    counter = 0;
    token = undefined;
    server.resetHandlers();
} );
afterAll( () => server.close() );

describe( 'Activation', () => {
    let resolveFunc: ( value?: unknown ) => void;
    it( 'sends activation request to server', async () => {
        await setup( '/' );
        await waitFor( () => expect( counter ).toBe( 1 ) );
    } );

    describe.each( [ { activationToken: '123' }, { activationToken: '456' } ] )( 'when token is $activationToken', ( { activationToken } ) => {
        it( 'sends token in request', async () => {
            await setup( `/activation/${ activationToken }` );
            await waitFor( () => {
                expect( token ).toBe( activationToken );
            } );
        } );
    } );

    describe( 'when token is changed', () => {
        it( 'sends request with new token', async () => {
            await setup( '/activation/123' );
            await waitFor( () => {
                expect( token ).toBe( '123' );
            } );
            router.push( '/activation/456' );
            await waitFor( () => {
                expect( token ).toBe( '456' );
            } );
        } );
    } );

    describe( 'when network failure occurs', () => {
        it( 'displays generic message', async () => {
            server.use(
                //@ts-ignore next-line
                http.patch( '/api/v1/users/:token/active', ( req, res, ctx ) => {
                    return res( ctx.networkError( 'Failed to connect' ) );
                } )
            );
            await setup( '/activation/123' );
            const text = await screen.findByText( 'Unexpected error occured. Please try again.' );
            expect( text ).toBeInTheDocument();
        } );
    } );

    describe( 'when token is invalid', () => {

        it( 'displays error message received in response', async () => {
            const promise = new Promise( ( resolve ) => {
                resolveFunc = resolve;
            } );
            server.use(
                http.patch( `/api/v1/users/:token/active`, async () => {
                    await promise;
                    return HttpResponse.json( { message: 'Activation failure' }, { status: 400 } );
                } )
            );
            await setup( '/activation/123' );
            expect( screen.queryByText( 'Activation failure' ) ).not.toBeInTheDocument();
            await resolveFunc();
            await waitFor( () => {
                expect( screen.getByText( 'Activation failure' ) ).toBeInTheDocument();
            } );
        } );
    } );

    describe( 'when token is valid', () => {
        it( 'displays success message received in response', async () => {
            const promise = new Promise( ( resolve ) => {
                resolveFunc = resolve;
            } );
            server.use(
                http.patch( '/api/v1/users/:token/active', async () => {
                    await promise;
                    return HttpResponse.json( { message: 'Account is activated' } );
                } )
            );
            await setup( '/activation/123' );
            expect( screen.queryByText( 'Account is activated' ) ).not.toBeInTheDocument();
            await resolveFunc();
            await waitFor( () => {
                expect( screen.queryByText( 'Account is activated' ) ).toBeInTheDocument();
            } );
        } );
    } );

    it( 'displays spinner', async () => {
        const promise = new Promise( ( resolve ) => {
            resolveFunc = resolve;
        } );
        server.use(
            http.patch( '/api/v1/users/:token/active', async () => {
                await promise;
                return HttpResponse.json( { message: 'Account is activated' } );
            } )
        );
        await setup( '/activation/123' );
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
            it( 'sends expected language in accept language header', async () => {
                i18n.global.locale.value = language as "en" | "en-US" | "de";
                let acceptLanguage: string | null;
                server.use(
                    http.patch( '/api/v1/users/:token/active', async ( { request } ) => {
                        acceptLanguage = request.headers.get( 'Accept-Language' );
                        await delay( 'infinite' );
                        return HttpResponse.json( {} );
                    } )
                );
                await setup( '/activation/123' );
                await waitFor( () => {
                    expect( acceptLanguage ).toBe( language );
                } );
            } );
        }
    );
} );