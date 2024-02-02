import http from '@/lib/http';
export const activate = ( token: any ) => {
  return http.patch( `/api/v1/users/${ token }/active` );
};