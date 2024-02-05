vi.mock( '@/lib/http' );
import { vi } from 'vitest';
import { passwordReset } from './api';
import http from '@/lib/http';

describe( 'password reset', () => {
  it( 'calls axios with expected parameters', () => {
    const body = { key: 'value' };
    passwordReset( body );
    expect( vi.mocked( http.post ) ).toHaveBeenCalledWith( '/api/v1/users/password-reset', body );
  } );
} );
