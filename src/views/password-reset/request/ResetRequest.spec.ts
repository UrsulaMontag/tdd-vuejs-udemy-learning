import { render, screen, waitFor } from 'test/helper';
import ResetRequest from './ResetRequest.vue';
import { setupServer } from 'msw/node';
import { HttpResponse, http, type DefaultBodyType, delay } from 'msw';
import { beforeAll, beforeEach, afterAll } from 'vitest';
import { i18n } from '@/locales';

let requestBody: DefaultBodyType;
let counter = 0;
const server = setupServer();

const setup = async () => {
    const { result, user } = render( ResetRequest );
    const emailInput = screen.getByLabelText( 'Email' );
    await user.type( emailInput, 'user123@mail.com' );
    const button = screen.getByRole( 'button', { name: /reset password/i } );
    return {
        ...result,
        user,
        elements: { button, emailInput }
    };
};

beforeAll( () => server.listen() );
beforeEach( () => {
    counter = 0;
    server.resetHandlers();
} );
afterAll( () => server.close() );

describe( 'Sign Up', () => {
    it( 'has a sign up header', () => {
        render( ResetRequest );
        const header = screen.getByRole( 'heading', { name: /reset password/i } );
        expect( header ).toBeInTheDocument();
    } );

    it( 'has email input', () => {
        render( ResetRequest );
        expect( screen.getByLabelText( 'Email' ) ).toBeInTheDocument();
    } );

    it( 'has email type for email input', () => {
        render( ResetRequest );
        expect( screen.getByLabelText( 'Email' ) ).toHaveAttribute( 'type', 'email' );
    } );
    it( 'has a reset password button', () => {
        render( ResetRequest );
        const button = screen.getByRole( 'button', { name: /reset password/i } );
        expect( button ).toBeInTheDocument();
    } );

    it( 'disables reset password button initially', () => {
        render( ResetRequest );
        expect( screen.getByRole( 'button', { name: /reset password/i } ) ).toBeDisabled();
    } );
    it( 'does not display spinner', () => {
        render( ResetRequest );
        expect( screen.queryByRole( 'status' ) ).not.toBeInTheDocument();
    } );

    describe( 'when user sets email', () => {
        it( 'enables reset password button', async () => {
            const {
                elements: { button }
            } = await setup();
            expect( button ).toBeEnabled();
        } );
        describe( 'when user submits form', () => {
            it( 'sends email to backend', async () => {
                server.use( http.post( '/api/v1/users/password-reset', async ( { request } ) => {
                    requestBody = await request.json();
                    return HttpResponse.json( { message: 'Check your email' } );
                } ) );
                const {
                    user,
                    elements: { button }
                } = await setup();
                await user.click( button );
                await waitFor( () =>
                    expect( requestBody ).toEqual( {
                        email: 'user123@mail.com',
                    } )
                );
            } );

            describe.each( [ { language: 'de' as 'de' }, { language: 'en' as 'en' } ] )(
                'when language is $language',
                ( { language } ) => {
                    it( 'sends expected language in accept language header', async () => {
                        let acceptLanguage: string | null = null;
                        server.use(
                            http.post( '/api/v1/users/password-reset', async ( { request } ) => {
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
                        http.post( '/api/v1/users/password-reset', async () => {
                            counter += 1;
                            await delay( 'infinite' );
                            return HttpResponse.json( { message: 'Check your email' } );
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
                        http.post( '/api/v1/users/password-reset', async () => {
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
            describe( 'when success response is received', () => {
                it( 'displays success message received from backend', async () => {
                    server.use(
                        http.post( '/api/v1/users/password-reset', () => {
                            return HttpResponse.json( { message: 'Check your email' } );
                        } )
                    );
                    const {
                        user,
                        elements: { button }
                    } = await setup();
                    await user.click( button );
                    const text = await screen.findByText( 'Check your email' );
                    expect( text ).toBeInTheDocument();
                } );
            } );
            describe( 'when network failure occurs', () => {
                it( 'displays generic message', async () => {
                    server.use(
                        http.post( 'api/v1/users/password-reset', () => {
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
                        http.post( 'api/v1/users/password-reset', () => {
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
                            http.post( 'api/v1/users/password-reset', async () => {
                                if ( !processedFirstRequest ) {
                                    processedFirstRequest = true;
                                    return HttpResponse.error();
                                }
                                else {
                                    return HttpResponse.json( { message: 'Check your email' } );
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

            describe( 'when email is invalid', () => {
                it( `displays validation error`, async () => {
                    server.use(
                        http.post( '/api/v1/users/password-reset', () => {
                            return HttpResponse.json(
                                {
                                    validationErrors: {
                                        email: 'E-mail not found'
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
                    const error = await screen.findByText( 'E-mail not found' );
                    await waitFor( () => {
                        expect( error ).toBeInTheDocument();
                    } );
                } );

                it( 'clears validation error when user changes the email field', async () => {
                    server.use(
                        http.post( '/api/v1/users/password-reset', () => {
                            return HttpResponse.json(
                                {
                                    validationErrors: {
                                        email: 'E-mail not found'
                                    }
                                },
                                { status: 400 }
                            );
                        } )
                    );
                    const {
                        user,
                        elements: { button, emailInput }
                    } = await setup();
                    await user.click( button );
                    const validationError = await screen.findByText( /E-mail not found/i );
                    await user.type( emailInput, 'Updated' );
                    expect( validationError ).not.toBeInTheDocument();
                } );
            } );
            describe( 'when there is no validation error', () => {
                it( 'displays error returned from server', async () => {
                    server.use(
                        http.post( '/api/v1/users/password-reset', () => {
                            return HttpResponse.json(
                                {
                                    message: 'Unknown user'
                                },
                                { status: 404 }
                            );
                        } )
                    );
                    const {
                        user,
                        elements: { button }
                    } = await setup();
                    await user.click( button );
                    const error = await screen.findByText( 'Unknown user' );
                    expect( error ).toBeInTheDocument();
                } );
            } );
        } );
    } );
} );
