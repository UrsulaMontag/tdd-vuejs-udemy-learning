import { render, router, screen, waitFor } from 'test/helper';
import ResetSet from './ResetSet.vue';
import { setupServer } from 'msw/node';
import { HttpResponse, http, type DefaultBodyType, delay } from 'msw';
import { i18n } from '@/locales';

let requestBody: DefaultBodyType;
let token: string | readonly string[];
let counter = 0;

const server = setupServer();

const setup = async () => {
    router.push( '/password-reset/set?tk=123' );
    await router.isReady();
    const { result, user } = render( ResetSet );
    const passwordInput = screen.getByLabelText( 'New password' );
    const passwordRepeatInput = screen.getByLabelText( 'New password repeat' );
    await user.type( passwordInput, 'Password1' );
    await user.type( passwordRepeatInput, 'Password1' );
    const button = screen.getByRole( 'button', { name: /set new password/i } );
    return {
        ...result,
        user,
        elements: { button, passwordInput, passwordRepeatInput }
    };
};

beforeAll( () => server.listen() );
beforeEach( () => {
    server.resetHandlers();
} );
afterAll( () => server.close() );

describe( 'set new password page', () => {
    it( 'has a set new password header', () => {
        render( ResetSet );
        const header = screen.getByRole( 'heading', { name: /set new password/i } );
        expect( header ).toBeInTheDocument();
    } );

    it( 'has password input', () => {
        render( ResetSet );
        expect( screen.getByLabelText( 'New password' ) ).toBeInTheDocument();
    } );

    it( 'has password type for password input', () => {
        render( ResetSet );
        expect( screen.getByLabelText( 'New password' ) ).toHaveAttribute( 'type', 'password' );
    } );

    it( 'has password repeat input', () => {
        render( ResetSet );
        expect( screen.getByLabelText( 'New password repeat' ) ).toBeInTheDocument();
    } );

    it( 'has password type for password input', () => {
        render( ResetSet );
        expect( screen.getByLabelText( 'New password repeat' ) ).toHaveAttribute( 'type', 'password' );
    } );
    it( 'has a set new password button', () => {
        render( ResetSet );
        const button = screen.getByRole( 'button', { name: /set new password/i } );
        expect( button ).toBeInTheDocument();
    } );

    it( 'disables set new password button initially', () => {
        render( ResetSet );
        expect( screen.getByRole( 'button', { name: /set new password/i } ) ).toBeDisabled();
    } );
    it( 'does not display spinner', () => {
        render( ResetSet );
        expect( screen.queryByRole( 'status' ) ).not.toBeInTheDocument();
    } );

    describe( 'when passwords do not match', () => {
        it( 'displays error', async () => {
            const {
                user,
                elements: { passwordInput, passwordRepeatInput }
            } = await setup();
            await user.type( passwordInput, 'Password1' );
            await user.type( passwordRepeatInput, 'Password2' );
            expect( screen.getByText( 'Passwords do not match' ) ).toBeInTheDocument();
        } );
    } );

    describe( 'when user sets same value for password inputs', () => {
        it( 'enables set new password button', async () => {
            const {
                elements: { button }
            } = await setup();
            expect( button ).toBeEnabled();
        } );
        describe( 'when user submits form', () => {
            it( 'sends new password and token to backend', async () => {
                server.use( http.patch( '/api/v1/users/:resetToken/password', async ( { request, params } ) => {
                    requestBody = await request.json();
                    token = params.resetToken;
                    return HttpResponse.json( { message: 'Password update success' } );
                } ) );
                const {
                    user,
                    elements: { button }
                } = await setup();
                await user.click( button );
                await waitFor( () => {
                    expect( token ).toBe( '123' );
                    expect( requestBody ).toEqual( {
                        password: 'Password1',
                    } );
                }
                );
            } );

            describe.each( [ { language: 'de' as 'de' }, { language: 'en' as 'en' } ] )(
                'when language is $language',
                ( { language } ) => {
                    it( 'sends expected language in accept language header', async () => {
                        let acceptLanguage: string | null = null;
                        server.use(
                            http.patch( '/api/v1/users/:resetToken/password', async ( { request } ) => {
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

            describe( 'when there is an ongoing api request', () => {
                it( 'does not allow clicking the button', async () => {
                    server.use(
                        http.patch( '/api/v1/users/:resetToken/password', async () => {
                            counter += 1;
                            await delay( 'infinite' );
                            return HttpResponse.json( { message: 'Password update success' } );
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
                        http.patch( '/api/v1/users/:resetToken/password', async () => {
                            await delay( 'infinite' );
                            return HttpResponse.json( { message: 'Password update success' } );
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
                it( 'navigates to login page', async () => {
                    server.use(
                        http.patch( '/api/v1/users/:resetToken/password', () => {
                            return HttpResponse.json( { message: 'Password update success' } );
                        } )
                    );
                    const {
                        user,
                        elements: { button }
                    } = await setup();
                    await user.click( button );
                    await waitFor( () => {
                        expect( router.currentRoute.value.name ).toBe( '/login' );
                    } );
                } );
            } );
            describe( 'when network failure occurs', () => {
                it( 'displays generic message', async () => {
                    server.use(
                        http.patch( '/api/v1/users/:resetToken/password', () => {
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
                        http.patch( '/api/v1/users/:resetToken/password', () => {
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
                    it( 'hides error message when api Set is in progress', async () => {
                        let processedFirstSet = false;
                        server.use(
                            http.patch( 'api/v1/users/password-reset', async () => {
                                if ( !processedFirstSet ) {
                                    processedFirstSet = true;
                                    return HttpResponse.error();
                                }
                                else {
                                    return HttpResponse.json( { message: 'Password update success' } );
                                }
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

            describe( 'when password is invalid', () => {
                beforeEach( () => {
                    server.use(
                        http.patch( '/api/v1/users/:resetToken/password', () => {
                            return HttpResponse.json(
                                {
                                    validationErrors: {
                                        password: 'Password cannot be null'
                                    }
                                },
                                { status: 400 }
                            );
                        } )
                    );
                } );
                it( `displays validation error`, async () => {
                    const {
                        user,
                        elements: { button }
                    } = await setup();
                    await user.click( button );
                    const error = await screen.findByText( 'Password cannot be null' );
                    await waitFor( () => {
                        expect( error ).toBeInTheDocument();
                    } );
                } );

                it( 'clears validation error when user changes the password field', async () => {
                    const {
                        user,
                        elements: { button, passwordInput }
                    } = await setup();
                    await user.click( button );
                    const validationError = await screen.findByText( /Password cannot be null/i );
                    await user.type( passwordInput, 'Updated' );
                    expect( validationError ).not.toBeInTheDocument();
                } );
            } );
            describe( 'when there is no validation error', () => {
                it( 'displays error returned from server', async () => {
                    server.use(
                        http.patch( '/api/v1/users/:resetToken/password', () => {
                            return HttpResponse.json(
                                {
                                    message: 'Invalid token'
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
                    const error = await screen.findByText( 'Invalid token' );
                    expect( error ).toBeInTheDocument();
                } );
            } );
        } );
    } );
} );
