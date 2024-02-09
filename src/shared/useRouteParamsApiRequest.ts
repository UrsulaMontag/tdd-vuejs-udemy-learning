import { type User } from "@/views/home/components/types/user";
import { AxiosError } from "axios";
import { ref, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";


const useRouteParamsApiRequest = ( apiFn: ( arg0: any ) => any, routeVariable: string | number ) => {
    const { t } = useI18n();
    const route = useRoute();


    const error = ref<string | undefined>();
    const status = ref<string>( '' );
    const data = ref<object>();

    watchEffect( async () => {
        status.value = 'loading';
        try {
            const response = await apiFn( route.params[ routeVariable ] );
            data.value = response.data;
            console.log( response.data, typeof response.data );
            status.value = 'success';
        } catch ( apiError ) {
            const axiosError = apiError as AxiosError;
            status.value = 'fail';
            if ( axiosError && axiosError.response?.data ) {
                const responseData = axiosError.response.data as { message?: string; };
                if ( responseData.message ) {
                    error.value = responseData.message;
                }
            } else {
                error.value = t( 'genericError' );
            }
        }
    } );
    return { status, data, error };
};
export default useRouteParamsApiRequest;