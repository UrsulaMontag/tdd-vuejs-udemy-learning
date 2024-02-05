vi.mock( '@/lib/http' );
import { vi } from 'vitest';
import { setPassword } from './api';
import http from '@/lib/http';

let body: { password: string; } | undefined;
describe( 'set-password', () => {
    it( 'calls axios with expected parameters', () => {
        setPassword( '123', body );
        expect( vi.mocked( http.patch ) ).toHaveBeenCalledWith( '/api/v1/users/123/password', body );
    } );
} );
