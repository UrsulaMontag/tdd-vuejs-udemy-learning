vi.hoisted( () => vi.resetModules() );
vi.mock( 'vue-router' );
vi.mock( 'vue-i18n' );
import AppActivation from './AppActivation.vue';
import { render, waitFor, screen } from '@testing-library/vue';
import { vi } from 'vitest';
import { computed } from 'vue';
import { useI18n, type Composer } from 'vue-i18n';
import en from '@/locales/translations/en.json';
import { activate } from './api';
import { useRoute, type RouteLocationNormalizedLoaded } from 'vue-router';
import { reactive } from 'vue';

vi.mock( './api', () => ( {
    activate: vi.fn( () => Promise.resolve( { data: {} } ) )
} ) );
const mockI18n: Partial<Composer> = {
    t: ( key: string ) => en[ key as keyof typeof en ],
    locale: computed( {
        get: () => 'ab',
        set: () => { }
    } )
};

const requestParams: RouteLocationNormalizedLoaded = {
    params: {
        token: '123'
    },
    matched: [],
    fullPath: '',
    query: {},
    hash: '',
    redirectedFrom: undefined,
    name: undefined,
    path: '',
    meta: {}
};

vi.mocked( useI18n ).mockReturnValue( mockI18n as Composer );
const mockUseRoute = vi.mocked( useRoute ).mockReturnValue( {
    ...requestParams,
    params: {
        token: '123'
    }
} );

const setup = async ( path?: string ) => {
    return render( AppActivation );
};

describe( 'Activation', () => {
    it( 'sends activation request to server', async () => {
        await setup( '/' );
        await waitFor( () => expect( activate ).toHaveBeenCalledTimes( 1 ) );
    } );

    describe.each( [ { activationToken: '123' }, { activationToken: '456' } ] )( 'when token is $activationToken', ( { activationToken } ) => {
        it( 'sends token in request', async () => {
            mockUseRoute.mockReturnValue( {
                ...requestParams,
                params: {
                    token: activationToken
                }
            } );

            await setup( `/activation/${ activationToken }` );
            await waitFor( () => {
                expect( activate ).toHaveBeenCalledWith( activationToken );
            } );
        } );
    } );

    describe( 'when token is changed', () => {
        it.only( 'sends request with new token', async () => {
            const route = reactive( {
                ...requestParams,
                params: {
                    token: '123'
                }
            } );
            mockUseRoute.mockReturnValue( route );
            await setup( '/activation/123' );
            await waitFor( () => {
                expect( activate ).toHaveBeenCalledWith( '123' );
            } );
            route.params.token = '456';
            await waitFor( () => {
                expect( activate ).toHaveBeenCalledWith( '456' );
            } );
        } );
    } );

    describe( 'when network failure occurs', () => {
        it( 'displays generic message', async () => {
            vi.mocked( activate ).mockRejectedValue( {} );
            await setup( '/activation/123' );
            const text = await screen.findByText( 'Unexpected error occured. Please try again.' );
            expect( text ).toBeInTheDocument();
        } );
    } );

    describe( 'when token is invalid', () => {
        let rejectFunc: ( reason: any ) => void;
        it( 'displays error message received in response', async () => {
            vi.mocked( activate ).mockImplementation(
                () =>
                    new Promise( ( reject ) => {
                        rejectFunc = reject;

                    } )
            );
            await setup();
            expect( screen.queryByText( 'Activation failure' ) ).not.toBeInTheDocument();
            await rejectFunc( { data: { message: 'Activation failure' } } );
            await waitFor( () => {
                expect( screen.getByText( 'Activation failure' ) ).toBeInTheDocument();
            } );
        } );
    } );

    let resolveFunc: ( reason: any ) => void;
    describe( 'when token is valid', () => {

        it( 'displays success message received in response', async () => {
            vi.mocked( activate ).mockImplementation(
                () =>
                    new Promise( ( resolve ) => {
                        resolveFunc = resolve;

                    } )
            );
            await setup();
            expect( screen.queryByText( 'Account is activated' ) ).not.toBeInTheDocument();
            await resolveFunc( { data: { message: 'Account is activated' } } );
            await waitFor( () => {
                expect( screen.queryByText( 'Account is activated' ) ).toBeInTheDocument();
            } );
        } );
    } );

    it( 'displays spinner', async () => {
        vi.mocked( activate ).mockImplementation(
            () =>
                new Promise( ( resolve ) => {
                    resolveFunc = resolve;

                } )
        );
        await setup();
        const spinner = await screen.findByRole( 'status' );
        expect( spinner ).toBeInTheDocument();
        await resolveFunc( { data: { message: 'Account is activated' } } );
        await waitFor( () => {
            expect( spinner ).not.toBeInTheDocument();
        } );
    } );
} );