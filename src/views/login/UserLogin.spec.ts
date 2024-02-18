import { render, screen, waitFor } from 'test/helper';
import UserLogin from '@/views/login/UserLogin.vue';
import { setupServer } from 'msw/node';
import { HttpResponse, http, type DefaultBodyType, delay } from 'msw';
import { beforeAll, beforeEach, afterAll } from 'vitest';
import { i18n } from '@/locales';

let requestBody: DefaultBodyType;
let counter = 0;
const server = setupServer(
    http.post( '/api/v1/auth', async ( { request } ) => {
        requestBody = await request.json();
        return HttpResponse.json( { id: 1, username: 'user 1', email: 'user1@mail.com', image: null } );
    } )
);

const setup = async () => {
    const { result, user } = render( UserLogin );
    const emailInput = screen.getByLabelText( 'Email' );
    const passwordInput = screen.getByLabelText( 'Password' );
    await user.type( emailInput, 'user123@mail.com' );
    await user.type( passwordInput, 'Password1' );
    const button = screen.getByRole( 'button', { name: /login/i } );
    return {
        ...result,
        user,
        elements: { button, passwordInput, emailInput }
    };
};

beforeAll( () => server.listen() );
beforeEach( () => {
    counter = 0;
    server.resetHandlers();
} );
afterAll( () => server.close() );

describe( 'User Login', () => {
    it( 'has a login header', () => {
        render( UserLogin );
        const header = screen.getByRole( 'heading', { name: /login/i } );
        expect( header ).toBeInTheDocument();
    } );

    it( 'has email input', () => {
        render( UserLogin );
        expect( screen.getByLabelText( 'Email' ) ).toBeInTheDocument();
    } );

    it( 'has email type for email input', () => {
        render( UserLogin );
        expect( screen.getByLabelText( 'Email' ) ).toHaveAttribute( 'type', 'email' );
    } );

    it( 'has password input', () => {
        render( UserLogin );
        expect( screen.getByLabelText( 'Password' ) ).toBeInTheDocument();
    } );

    it( 'has password type for password input', () => {
        render( UserLogin );
        expect( screen.getByLabelText( 'Password' ) ).toHaveAttribute( 'type', 'password' );
    } );

    it( 'has a login button', () => {
        render( UserLogin );
        const button = screen.getByRole( 'button', { name: /login/i } );
        expect( button ).toBeInTheDocument();
    } );

    it( 'disables login button initially', () => {
        render( UserLogin );
        expect( screen.getByRole( 'button', { name: /login/i } ) ).toBeDisabled();
    } );
    it( 'does not display spinner', () => {
        render( UserLogin );
        expect( screen.queryByRole( 'status' ) ).not.toBeInTheDocument();
    } );

    describe( 'when user sets same value for inputs', () => {
        it( 'enables the button', async () => {
            const {
                elements: { button }
            } = await setup();
            expect( button ).toBeEnabled();
        } );
        describe( 'when user submits form', () => {
            it( 'sends email and password to backend', async () => {
                const {
                    user,
                    elements: { button }
                } = await setup();
                await user.click( button );
                await waitFor( () =>
                    expect( requestBody ).toEqual( {
                        email: 'user123@mail.com',
                        password: 'Password1'
                    } )
                );
            } );

            describe.each( [ { language: 'de' as 'de' }, { language: 'en' as 'en' } ] )(
                'when language is $language',
                ( { language } ) => {
                    it( 'sends expected language in accept language header', async () => {
                        let acceptLanguage: string | null = null;
                        server.use(
                            http.post( '/api/v1/auth', async ( { request } ) => {
                                acceptLanguage = request.headers.get( 'Accept-Language' );
                                await delay( 'infinite' );
                                return HttpResponse.json( {} );
                            } )
                        );
                        const {
                            user,
                            elements: { button }
                        } = await setup();
                        i18n.global.locale.value = language;
                        await user.click( button );
                        await waitFor( () => expect( acceptLanguage ).toBe( language ) );
                    } );
                }
            );

            describe( 'when there is an ongoing api call', () => {
                it( 'does not allow clicking the button', async () => {
                    server.use(
                        http.post( '/api/v1/auth', async () => {
                            counter += 1;
                            await delay( 'infinite' );
                            return HttpResponse.json( {
                                id: 1,
                                username: 'user 1',
                                email: 'user1@mail.com',
                                image: null
                            } );
                        } )
                    );
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
                        http.post( '/api/v1/auth', async () => {
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

            describe( 'when network failure occurs', () => {
                it( 'displays generic message', async () => {
                    server.use(
                        http.post( 'api/v1/auth', () => {
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
                            http.post( 'api/v1/auth', async () => {
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
                { field: 'email', message: 'Email cannot be null' },
                { field: 'password', message: 'Password cannot be null' }
            ] )( 'when $field is invalid', ( { field, message } ) => {
                it( `displays ${ message }`, async () => {
                    server.use(
                        http.post( '/api/v1/auth', async () => {
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
                        http.post( '/api/v1/auth', async () => {
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

                    type ElementKeys =
                        | 'button'
                        | 'passwordInput'
                        | 'emailInput';
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
            describe( 'when there is no validation error', () => {
                it( 'displays error returned from server', async () => {
                    server.use(
                        http.post( '/api/v1/auth', () => {
                            return HttpResponse.json(
                                {
                                    message: 'Incorrect credentials'
                                },
                                { status: 401 }
                            );
                        } )
                    );
                    const {
                        user,
                        elements: { button }
                    } = await setup();
                    await user.click( button );
                    const error = await screen.findByText( 'Incorrect credentials' );
                    expect( error ).toBeInTheDocument();
                } );
            } );
        } );
    } );
} );
