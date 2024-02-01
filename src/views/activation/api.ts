import http from '@/lib/http';
export const activate = ( token: any ) => {
  return axios.patch( `/api/v1/users/${ token }/active`, {}, {
    headers: {
      'Accept-Language': i18n.global.locale.value
    }
  } );
};