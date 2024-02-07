import { setupServer } from 'msw/node';
import { HttpResponse, delay, http } from 'msw';
import UserView from './UserView.vue';
import { render, router } from 'test/helper';
import { i18n } from '@/locales';

let counter = 0;
let token: string | readonly string[] | undefined;
const server = setupServer(
    http.patch( '/api/v1/users/:token/active', ( { params } ) => {
        counter += 1;
        token = params.token;
        return HttpResponse.json( {} );
    } )
);
const setup = async ( path: string ) => {
    router.push( path );
    await router.isReady();
    return render( AppActivation );
};