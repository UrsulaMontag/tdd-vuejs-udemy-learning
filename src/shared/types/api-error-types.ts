import { AxiosError } from 'axios';

export type FormStateType = {
    username?: string;
    email?: string;
    password?: string;
    passwordRepeat?: string;
};
type ValidationErrorsType = {
    username?: string;
    email?: string;
    password?: string;
    passwordRepeat?: string;
    img?: string;
};
export type ResponseDataType = {
    message: string;
    validationErrors?: ValidationErrorsType;
};
export type ErrorsType = ValidationErrorsType | AxiosError;
