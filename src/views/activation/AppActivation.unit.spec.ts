vi.hoisted( () => vi.resetModules() );
import AppActivation from './AppActivation.vue';
import { render, screen } from '@testing-library/vue';
import { vi } from 'vitest';
import { activate } from './api';
import { ref, type Ref } from 'vue';
import useRouteParamsApiRequest from '@/shared/useRouteParamsApiRequest';
type MyModule = {
    default: ( apiFn: ( arg0: any ) => any, routeVariable: string | number ) => {
        status: Ref<string>,
        data: Ref<object>,
        error: Ref<string | undefined>;
    };
};

vi.mock( '@/shared/useRouteParamsApiRequest', async ( importOriginal: () => Promise<MyModule> ) => {
    const actual = await importOriginal();
    return {
        ...actual,
        default: vi.fn( () => ( {
            status: '',
            data: {},
            error: ''
        } ) )
    };
} );

vi.mock( './api', () => ( {
    activate: vi.fn( () => Promise.resolve( { data: {} } ) )
} ) );

describe( 'Activation', () => {
    beforeEach( () => {
        vi.mocked( useRouteParamsApiRequest ).mockReturnValue( {
            status: ref( 'loading' ),
            data: ref( undefined ),
            error: ref( undefined )
        } );
    } );

    it( 'calls mockUseRouteParamsApiRequest with expected params', async () => {
        render( AppActivation );
        expect( vi.mocked( useRouteParamsApiRequest ) ).toHaveBeenCalledWith( activate, 'token' );
    } );

    describe( 'when status is loading', () => {
        it( 'displays spinner', async () => {
            render( AppActivation );
            const spinner = await screen.findByRole( 'status' );
            expect( spinner ).toBeInTheDocument();
        } );
    } );

    describe( 'when status is success', () => {
        it( 'displays data message', async () => {
            vi.mocked( useRouteParamsApiRequest ).mockReturnValue( {
                status: ref( 'success' ),
                data: ref( { message: 'Success!!' } ),
                error: ref( undefined )
            } );
            render( AppActivation );
            const message = await screen.findByText( 'Success!!' );
            expect( message ).toBeInTheDocument();
        } );
    } );


    describe( 'when status is fail', () => {
        it( 'displays error message', async () => {
            vi.mocked( useRouteParamsApiRequest ).mockReturnValue( {
                status: ref( 'fail' ),
                data: ref( undefined ),
                error: ref( 'Error!!' )
            } );
            render( AppActivation );
            const message = await screen.findByText( 'Error!!' );
            expect( message ).toBeInTheDocument();
        } );
    } );
} );
