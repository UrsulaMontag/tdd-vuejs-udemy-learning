import http from '@/lib/http';

export const deleteUser = ( id: number ) => {
  return http.delete( `/api/v1/users/${ id }` );
};

export const updateUser = ( id: number, body: any ) => {
  return http.put( `/api/v1/users/${ id }`, body );
};
