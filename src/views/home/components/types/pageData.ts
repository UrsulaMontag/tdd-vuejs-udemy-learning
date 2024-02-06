import { type User } from "./user";

export type PageData = {
    content: User[];
    page: number;
    size: number;
    totalPages: number;
};