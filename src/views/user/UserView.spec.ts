import { setupServer } from 'msw/node';
import { HttpResponse, delay, http } from 'msw';
import UserView from './UserView.vue';
import { render, router, waitFor, screen } from 'test/helper';
import { i18n } from '@/locales';
import { vi } from 'vitest';

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

const confirmSpy = vi.spyOn( window, 'confirm' );


describe( 'User page', () => {
    let resolveFunc: ( value?: unknown ) => void;
    it( 'sends fetch request to server', async () => {
        await setup( '/' );
        await waitFor( () => expect( counter ).toBe( 1 ) );
    } );

    describe.each( [ { userId: '125' }, { userId: '269' } ] )( 'when id is $userId', ( { userId } ) => {
        it( 'sends id in request', async () => {
            await setup( `/user/${ userId }` );
            await waitFor( () => {
                expect( id ).toBe( userId );
            } );
        } );
    } );

    describe( 'when id is changed', () => {
        it( 'sends request with new id', async () => {
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
        it( 'displays generic message', async () => {
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
        it( 'displays error message received in response', async () => {
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
        it( 'displays username on userpage', async () => {
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

    it( 'displays spinner', async () => {
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
            it( 'sends expected language in accept language header', async () => {
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

    describe( 'when there is logged in user', () => {
        const setupPageLoaded = async ( id = '3' ) => {
            const result = await setup( `/user/${ id }` );
            await screen.findByText( `user${ id }` );
            const deleteButton = screen.queryByRole( 'button', { name: 'Delete' } );
            const editButton = screen.queryByRole( 'button', { name: 'Edit' } );
            return { ...result, elements: { deleteButton, editButton } };
        };

        beforeEach( () => {
            localStorage.setItem( 'auth', JSON.stringify( { id: 3, username: 'user3' } ) );
        } );
        describe( 'when user id matches to logged in user id', () => {
            it( 'displays delete button', async () => {
                const {
                    elements: { deleteButton }
                } = await setupPageLoaded();
                expect( deleteButton ).toBeInTheDocument();
            } );
        } );

        it( 'displays edit button', async () => {
            const {
                elements: { editButton }
            } = await setupPageLoaded();
            expect( editButton ).toBeInTheDocument();
        } );

        describe( 'when user clicks edit button', () => {
            it( 'hides edit button', async () => {
                const {
                    user,
                    elements: { editButton }
                } = await setupPageLoaded();
                await user.click( editButton! );
                expect( editButton ).not.toBeInTheDocument();
            } );

            it( 'hides delete button', async () => {
                const {
                    user,
                    elements: { editButton, deleteButton }
                } = await setupPageLoaded();
                await user.click( editButton! );
                expect( deleteButton ).not.toBeInTheDocument();
            } );

            it( 'hides username', async () => {
                const {
                    user,
                    elements: { editButton }
                } = await setupPageLoaded();
                await user.click( editButton! );
                expect( screen.queryByText( 'user3' ) ).not.toBeInTheDocument();
            } );
            it( 'displays username input', async () => {
                const {
                    user,
                    elements: { editButton }
                } = await setupPageLoaded();
                await user.click( editButton! );
                expect( screen.getByLabelText( 'Username' ) ).toBeInTheDocument();
            } );


            it( 'sets username as initial value for input', async () => {
                const {
                    user,
                    elements: { editButton }
                } = await setupPageLoaded();
                await user.click( editButton! );
                expect( screen.getByLabelText( 'Username' ) ).toHaveValue( 'user3' );
            } );

            it( 'displays save button', async () => {
                const {
                    user,
                    elements: { editButton }
                } = await setupPageLoaded();
                await user.click( editButton! );
                expect( screen.queryByRole( 'button', { name: 'Save' } ) ).toBeInTheDocument();
            } );

            it( 'displays cancel button', async () => {
                const {
                    user,
                    elements: { editButton }
                } = await setupPageLoaded();
                await user.click( editButton! );
                expect( screen.queryByRole( 'button', { name: 'Cancel' } ) ).toBeInTheDocument();
            } );



            describe( 'when username is changed', () => {
                describe( 'when user clicks cancel', () => {
                    it( 'displays initial username', async () => {
                        const {
                            user,
                            elements: { editButton }
                        } = await setupPageLoaded();
                        await user.click( editButton! );
                        await user.type( screen.getByLabelText( 'Username' ), '-updated' );
                        await user.click( screen.queryByRole( 'button', { name: 'Cancel' } )! );
                        await waitFor( () => {
                            expect( screen.queryByText( 'user3' ) ).toBeInTheDocument();
                        } );
                    } );
                } );
            } );

            describe( 'when user clicks cancel', () => {
                it( 'displays username', async () => {
                    const {
                        user,
                        elements: { editButton }
                    } = await setupPageLoaded();
                    await user.click( editButton! );
                    await user.click( screen.queryByRole( 'button', { name: 'Cancel' } )! );
                    await waitFor( () => {
                        expect( screen.queryByText( 'user3' ) ).toBeInTheDocument();
                    } );
                } );
            } );

            describe( 'when user clicks save', () => {
                it( 'sends update request for logged in user', async () => {
                    let id: string | readonly string[];
                    server.use(
                        http.put( '/api/v1/users/:id', async ( { params } ) => {
                            id = params.id;
                            return HttpResponse.json( {} );
                        } )
                    );
                    const {
                        user,
                        elements: { editButton }
                    } = await setupPageLoaded();
                    await user.click( editButton! );
                    await user.click( screen.getByRole( 'button', { name: 'Save' } ) );
                    await waitFor( () => {
                        expect( id ).toBe( '3' );
                    } );
                } );

                it( 'sends request with updated username', async () => {
                    let requestBody;
                    server.use(
                        http.put( '/api/v1/users/:id', async ( { request } ) => {
                            requestBody = await request.json();
                            return HttpResponse.json( {} );
                        } )
                    );
                    const {
                        user,
                        elements: { editButton }
                    } = await setupPageLoaded();
                    await user.click( editButton! );
                    await user.type( screen.getByLabelText( 'Username' ), '-updated' );
                    await user.click( screen.getByRole( 'button', { name: 'Save' } ) );
                    await waitFor( () => {
                        expect( requestBody! ).toStrictEqual( { username: 'user3-updated' } );
                    } );
                } );

                describe( 'when api request in progress', () => {
                    it( 'displays spinner', async () => {
                        server.use(
                            http.put( '/api/v1/users/:id', async () => {
                                await delay( 'infinite' );
                                return HttpResponse.json( {} );
                            } )
                        );
                        const {
                            user,
                            elements: { editButton }
                        } = await setupPageLoaded();
                        await user.click( editButton! );
                        await user.click( screen.getByRole( 'button', { name: 'Save' } ) );
                        await waitFor( () => {
                            expect( screen.queryByRole( 'status' ) ).toBeInTheDocument();
                        } );
                    } );
                } );
                describe( 'when result is success', () => {
                    it( 'displays non edit mode', async () => {
                        server.use(
                            http.put( '/api/v1/users/:id', async () => {
                                return HttpResponse.json( {} );
                            } )
                        );
                        const {
                            user,
                            elements: { editButton }
                        } = await setupPageLoaded();
                        await user.click( editButton! );
                        await user.click( screen.getByRole( 'button', { name: 'Save' } ) );
                        await waitFor( () => {
                            expect( screen.getByRole( 'button', { name: 'Edit' } ) ).toBeInTheDocument();
                        } );
                    } );

                    it( 'displays updated name', async () => {
                        server.use(
                            http.put( '/api/v1/users/:id', async () => {
                                return HttpResponse.json( { username: 'user3-updated' } );
                            } )
                        );
                        const {
                            user,
                            elements: { editButton }
                        } = await setupPageLoaded();
                        await user.click( editButton! );
                        await user.type( screen.getByLabelText( 'Username' ), '-updated' );
                        await user.click( screen.getByRole( 'button', { name: 'Save' } ) );
                        await waitFor( () => {
                            expect( screen.getByText( 'user3-updated' ) ).toBeInTheDocument();
                        } );
                    } );
                } );

                describe( 'when network failure occurs', () => {
                    it( 'displays message generic error message', async () => {
                        server.use(
                            http.put( '/api/v1/users/:id', () => {
                                return HttpResponse.error();
                            } )
                        );
                        const {
                            user,
                            elements: { editButton }
                        } = await setupPageLoaded();
                        await user.click( editButton! );
                        await user.click( screen.getByRole( 'button', { name: 'Save' } ) );
                        const text = await screen.findByText( 'Unexpected error occured. Please try again.' );
                        expect( text ).toBeInTheDocument();
                    } );

                    it( 'hides spinner', async () => {
                        server.use(
                            http.put( '/api/v1/users/:id', () => {
                                return HttpResponse.error();
                            } )
                        );
                        const {
                            user,
                            elements: { editButton }
                        } = await setupPageLoaded();
                        await user.click( editButton! );
                        await user.click( screen.getByRole( 'button', { name: 'Save' } ) );
                        await waitFor( () => {
                            expect( screen.queryByRole( 'status' ) ).not.toBeInTheDocument();
                        } );
                    } );

                    describe( 'when user submits again', () => {
                        it( 'hides error when api request in progress', async () => {
                            let processedFirstRequest = false;
                            server.use(
                                http.put( '/api/v1/users/:id', async () => {
                                    if ( !processedFirstRequest ) {
                                        processedFirstRequest = true;
                                        return HttpResponse.error();
                                    } else {
                                        await delay( 'infinite' );
                                        return HttpResponse.json( {} );
                                    }
                                } )
                            );
                            const {
                                user,
                                elements: { editButton }
                            } = await setupPageLoaded();
                            await user.click( editButton! );
                            await user.click( screen.getByRole( 'button', { name: 'Save' } ) );
                            await screen.findByText( 'Unexpected error occured. Please try again.' );
                            await user.click( screen.getByRole( 'button', { name: 'Save' } ) );
                            await waitFor( () => {
                                expect(
                                    screen.queryByText( 'Unexpected error occured. Please try again.' )
                                ).not.toBeInTheDocument();
                            } );
                        } );
                    } );

                    describe( 'when username is invalid', () => {
                        it( 'displays validation error', async () => {
                            server.use(
                                http.put( '/api/v1/users/:id', () => {
                                    return HttpResponse.json(
                                        {
                                            validationErrors: {
                                                username: 'Username cannot be null'
                                            }
                                        },
                                        { status: 400 }
                                    );
                                } )
                            );
                            const {
                                user,
                                elements: { editButton }
                            } = await setupPageLoaded();
                            await user.click( editButton! );
                            await user.click( screen.getByRole( 'button', { name: 'Save' } ) );
                            const validationError = await screen.findByText( 'Username cannot be null' );
                            await waitFor( () => {
                                expect( validationError ).toBeInTheDocument();
                            } );
                        } );

                        it( 'clears validation error after username field is updated', async () => {
                            server.use(
                                http.put( '/api/v1/users/:id', () => {
                                    return HttpResponse.json(
                                        {
                                            validationErrors: {
                                                username: 'Username cannot be null'
                                            }
                                        },
                                        { status: 400 }
                                    );
                                } )
                            );
                            const {
                                user,
                                elements: { editButton }
                            } = await setupPageLoaded();
                            await user.click( editButton! );
                            await user.click( screen.getByRole( 'button', { name: 'Save' } ) );
                            const validationError = await screen.findByText( 'Username cannot be null' );
                            await user.type( screen.getByLabelText( 'Username' ), '-updated' );
                            expect( validationError ).not.toBeInTheDocument();
                        } );
                    } );

                    /* describe( 'when image is invalid', () => {
                        it( 'displays validation error', async () => {
                            server.use(
                                http.put( '/api/v1/users/:id', () => {
                                    return HttpResponse.json(
                                        {
                                            validationErrors: {
                                                image: 'Only png or jpeg files are allowed'
                                            }
                                        },
                                        { status: 400 }
                                    );
                                } )
                            );
                            const {
                                user,
                                elements: { editButton }
                            } = await setupPageLoaded();
                            await user.click( editButton );
                            await user.click( screen.getByRole( 'button', { name: 'Save' } ) );
                            const validationError = await screen.findByText(
                                'Only png or jpeg files are allowed'
                            );
                            expect( validationError ).toBeInTheDocument();
                        } );
                        it( 'clears validation error after user selecst new image', async () => {
                            server.use(
                                http.put( '/api/v1/users/:id', () => {
                                    return HttpResponse.json(
                                        {
                                            validationErrors: {
                                                image: 'Only png or jpeg files are allowed'
                                            }
                                        },
                                        { status: 400 }
                                    );
                                } )
                            );
                            const {
                                user,
                                elements: { editButton }
                            } = await setupPageLoaded();
                            await user.click( editButton );
                            await user.click( screen.getByRole( 'button', { name: 'Save' } ) );
                            const validationError = await screen.findByText(
                                'Only png or jpeg files are allowed'
                            );
                            const fileUploadInput = screen.getByLabelText( 'Select Image' );
                            await user.upload(
                                fileUploadInput,
                                new File( [ 'hello' ], 'hello.png', { type: 'image/png' } )
                            );
                            expect( validationError ).not.toBeInTheDocument();
                        } );
                    } ); */
                } );
            } );
        } );

        describe( 'when user clicks delete button', () => {
            beforeEach( () => {
                confirmSpy.mockReturnValue( false );
            } );
            it( 'displays confirm dialog', async () => {
                const {
                    user,
                    elements: { deleteButton }
                } = await setupPageLoaded();
                await user.click( deleteButton! );
                expect( confirmSpy ).toHaveBeenCalledWith( 'Are you sure?' );
            } );
            describe( 'when user confirms', () => {
                beforeEach( () => {
                    confirmSpy.mockReturnValueOnce( true );
                } );
                it( 'sends delete request to backend', async () => {
                    let id: string | readonly string[];
                    server.use(
                        http.delete( '/api/v1/users/:id', async ( { params } ) => {
                            id = params.id;
                            return HttpResponse.json( {} );
                        } )
                    );
                    const {
                        user,
                        elements: { deleteButton }
                    } = await setupPageLoaded();
                    await user.click( deleteButton! );
                    await waitFor( () => {
                        expect( id ).toBe( '3' );
                    } );
                } );

                describe( 'when api request in progress', () => {
                    it( 'displays spinner', async () => {
                        server.use(
                            http.delete( '/api/v1/users/:id', async () => {
                                await delay( 'infinite' );
                                return HttpResponse.json( {} );
                            } )
                        );
                        const {
                            user,
                            elements: { deleteButton }
                        } = await setupPageLoaded();
                        expect( screen.queryByRole( 'status' ) ).not.toBeInTheDocument();
                        await user.click( deleteButton! );
                        await waitFor( () => {
                            expect( screen.queryByRole( 'status' ) ).toBeInTheDocument();
                        } );
                    } );
                } );
                describe( 'when result is success', () => {
                    it( 'navigates to home', async () => {
                        server.use(
                            http.delete( '/api/v1/users/:id', async () => {
                                return HttpResponse.json( {} );
                            } )
                        );
                        const {
                            user,
                            elements: { deleteButton }
                        } = await setupPageLoaded();
                        await user.click( deleteButton! );
                        await waitFor( () => {
                            expect( router.currentRoute.value.path ).toBe( '/' );
                        } );
                    } );

                    it( 'should log user out', async () => {
                        server.use(
                            http.delete( '/api/v1/users/:id', async () => {
                                return HttpResponse.json( {} );
                            } )
                        );
                        const {
                            user,
                            elements: { deleteButton }
                        } = await setupPageLoaded();
                        await user.click( deleteButton! );
                        await waitFor( () => {
                            expect( JSON.parse( localStorage.getItem( 'auth' )! ).id ).toBe( 0 );
                        } );
                    } );
                } );

                describe( 'when result is error', () => {
                    it( 'displays generic error message', async () => {
                        server.use(
                            http.delete( '/api/v1/users/:id', async () => {
                                return HttpResponse.error();
                            } )
                        );
                        const {
                            user,
                            elements: { deleteButton }
                        } = await setupPageLoaded();
                        await user.click( deleteButton! );
                        await waitFor( () => {
                            expect(
                                screen.queryByText( 'Unexpected error occured. Please try again.' )
                            ).toBeInTheDocument();
                        } );
                    } );

                    it( 'hides spinner', async () => {
                        server.use(
                            http.delete( '/api/v1/users/:id', async () => {
                                return HttpResponse.error();
                            } )
                        );
                        const {
                            user,
                            elements: { deleteButton }
                        } = await setupPageLoaded();
                        await user.click( deleteButton! );
                        await screen.findByText( 'Unexpected error occured. Please try again.' );
                        expect( screen.queryByRole( 'status' ) ).not.toBeInTheDocument();
                    } );
                    describe( 'when user clicks again', () => {
                        it( 'hides error message', async () => {
                            const processedFirstRequest = false;
                            server.use(
                                http.delete( '/api/v1/users/:id', async () => {
                                    if ( !processedFirstRequest ) {
                                        return HttpResponse.error();
                                    } else {
                                        await delay( 'infinite' );
                                        return HttpResponse.json( {} );
                                    }
                                } )
                            );
                            const {
                                user,
                                elements: { deleteButton }
                            } = await setupPageLoaded();
                            await user.click( deleteButton! );
                            const error = await screen.findByText( 'Unexpected error occured. Please try again.' );
                            await user.click( deleteButton! );
                            expect( error ).not.toBeInTheDocument();
                        } );
                    } );
                } );
            } );

            describe( 'when user cancels', () => {
                it( 'stays on profile page', async () => {
                    server.use(
                        http.delete( '/api/v1/users/:id', async () => {
                            return HttpResponse.json( {} );
                        } )
                    );
                    const {
                        user,
                        elements: { deleteButton }
                    } = await setupPageLoaded();
                    await user.click( deleteButton! );
                    await waitFor( () => {
                        expect( router.currentRoute.value.path ).toBe( '/user/3' );
                    } );
                } );
            } );
        } );

        describe( 'when user id not matches logged in user id', () => {
            it( 'does not display delete button', async () => {
                const {
                    elements: { deleteButton }
                } = await setupPageLoaded( '1' );
                expect( deleteButton ).not.toBeInTheDocument();
            } );

            it( 'does not display edit button', async () => {
                const {
                    elements: { editButton }
                } = await setupPageLoaded( '1' );
                expect( editButton ).not.toBeInTheDocument();
            } );
        } );
    } );
} );