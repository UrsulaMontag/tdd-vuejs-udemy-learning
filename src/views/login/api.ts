import http from '@/lib/http';

export const login = ( body: any ) => {
  return http.post( '/api/v1/auth', body );
};
