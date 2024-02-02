vi.mock( '@/lib/http' );
import { vi } from 'vitest';
import { activate } from './api';
import http from '@/lib/http';

describe( 'activate', () => {
    it( 'calls axios with expected parameters', () => {
        activate( '123' );
        expect( vi.mocked( http.patch ) ).toHaveBeenCalledWith( '/api/v1/users/123/active' );
    } );
} );
