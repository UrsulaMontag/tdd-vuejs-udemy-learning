import { defineStore } from "pinia";
import { watch } from "vue";
import { reactive } from "vue";

interface Auth {
    id: number;
    username?: string;
    email?: string;
}

export const useAuthStore = defineStore( 'auth', () => {

    let initialState = {
        id: 0,
    };
    const storedState = localStorage.getItem( 'auth' );
    if ( storedState !== null ) {
        try {
            initialState = JSON.parse( storedState );
        } catch {
            console.error( 'Error parsing auth state' );
        }
    }

    const auth: Auth = reactive( initialState );

    const setLoggedIn = ( data: Auth ) => {
        auth.id = data.id;
        auth.username = data.username;
        auth.email = data.email;
    };

    const logout = () => {
        auth.id = 0;
        delete auth.username;
        delete auth.email;
    };

    watch( auth, () => {
        localStorage.setItem( 'auth', JSON.stringify( auth ) );
    } );

    return { auth, setLoggedIn, logout };
} );