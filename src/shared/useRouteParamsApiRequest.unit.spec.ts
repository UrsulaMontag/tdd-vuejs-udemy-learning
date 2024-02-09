vi.hoisted( () => vi.resetModules() );
vi.mock( 'vue-router' );
vi.mock( 'vue-i18n' );
import { render, waitFor, screen } from '@testing-library/vue';
import { vi } from 'vitest';
import { computed } from 'vue';
import { useI18n, type Composer } from 'vue-i18n';
import en from '@/locales/translations/en.json';
import { useRoute, type RouteLocationNormalizedLoaded } from 'vue-router';
import { reactive } from 'vue';
import useRouteParamsApiRequest from './useRouteParamsApiRequest';

const mockI18n: Partial<Composer> = {
    t: ( key: string ) => {
        const value = en[ key as keyof typeof en ];
        return typeof value === 'string' ? value : key;
    },
    locale: computed( {
        get: () => 'ab',
        set: () => { }
    } )
};
vi.mocked( useI18n ).mockReturnValue( mockI18n as Composer );

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

const route = { token: '123' };
vi.mocked( useRoute ).mockReturnValue( {
    ...requestParams,
    params:
        route

} );


describe( 'useRouteParamsApiRequest', () => {
    it( 'calls apiFn with expected params', () => {
        const mockApiFn = vi.fn();
        useRouteParamsApiRequest( mockApiFn, 'token' );
        expect( mockApiFn ).toHaveBeenCalledWith( '123' );
    } );
    describe( 'when route is changed', () => {
        it( 'calls apiFn with new params', async () => {
            const mockApiFn = vi.fn();
            useRouteParamsApiRequest( mockApiFn, 'token' );
            route.token = '456';
            useRouteParamsApiRequest( mockApiFn, 'token' );
            await waitFor( () => {
                expect( mockApiFn ).toHaveBeenCalledWith( '456' );
            } );
        } );
    } );
    describe( 'when apiFn in progress', () => {
        it( 'should return expected result', () => {
            const mockApiFn = vi.fn();
            const { status, error, data } = useRouteParamsApiRequest( mockApiFn, 'token' );
            expect( status.value ).toBe( 'loading' );
            expect( data.value ).toBe( undefined );
            expect( error.value ).toBe( undefined );
        } );
    } );
    describe( 'when apiFn resolves', () => {
        it( 'should return expected result', async () => {
            const mockApiFn = vi.fn().mockResolvedValue( { data: { message: 'success message' } } );
            const { status, error, data } = useRouteParamsApiRequest( mockApiFn, 'token' );
            await waitFor( () => {
                expect( status.value ).toBe( 'success' );
                expect( data.value ).toStrictEqual( { message: 'success message' } );
                expect( error.value ).toBe( undefined );
            } );

        } );
    } );
    describe( 'when apiFn rejects', () => {
        describe( 'when response message exists', () => {
            it( 'should return expected result', async () => {
                const mockApiFn = vi.fn()
                    .mockRejectedValue( { isAxiosError: true, response: { data: { message: 'error message' } } } );
                const { status, error, data } = useRouteParamsApiRequest( mockApiFn, 'token' );
                await waitFor( () => {
                    expect( status.value ).toBe( 'fail' );
                    expect( data.value ).toBeUndefined();
                    expect( error.value ).toBe( 'error message' );
                } );

            } );
        } );
        describe( 'when response message does not exists', () => {
            it( 'should return expected result', async () => {
                const mockApiFn = vi.fn()
                    .mockRejectedValue( {} );
                const { status, error, data } = useRouteParamsApiRequest( mockApiFn, 'token' );
                await waitFor( () => {
                    expect( status.value ).toBe( 'fail' );
                    expect( data.value ).toBeUndefined();
                    expect( error.value ).toBe( "Unexpected error occured. Please try again." );
                } );

            } );
        } );
    } );
} );