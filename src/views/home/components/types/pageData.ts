import { type User } from "./User";

export type PageData = {
    content: User[];
    page: number;
    size: number;
    totalPages: number;
};