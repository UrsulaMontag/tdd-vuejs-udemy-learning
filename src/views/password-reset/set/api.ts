import http from '@/lib/http';
export const setPassword = ( token: any, body: { password: string; } | undefined ) => {
  return http.patch( `/api/v1/users/${ token }/password`, body );
};