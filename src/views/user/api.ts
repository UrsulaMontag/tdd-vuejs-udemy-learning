import http from '@/lib/http';

export const fetchUser = ( id: any ) => {
  return http.get( `/api/v1/users/${ id }` );
};