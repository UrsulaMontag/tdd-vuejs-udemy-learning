vi.mock( '@/lib/http' );
import { vi } from 'vitest';
import { signUp } from './api';
import http from '@/lib/http';

describe( 'signUp', () => {
  it( 'calls axios with expected parameters', () => {
    const body = { key: 'value' };
    signUp( body );
    expect( vi.mocked( http.post ) ).toHaveBeenCalledWith( '/api/v1/users', body );
  } );
} );
