import { defineStore } from "pinia";
import { watch } from "vue";
import { reactive } from "vue";

interface Auth {
    id: number;
    username?: string;
    email?: string;
}

export const useAuthStore = defineStore( 'auth', () => {

    const auth: Auth = reactive( {
        id: 0
    } );

    const setLoggedIn = ( data: Auth ) => {
        auth.id = data.id;
        auth.username = data.username;
        auth.email = data.email;
    };

    watch( auth, () => {
        localStorage.setItem( 'auth', JSON.stringify( auth ) );
    } );

    return { auth, setLoggedIn };
} );
