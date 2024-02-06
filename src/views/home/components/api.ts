import http from "@/lib/http";

export const loadUsers = () => http.get( '/api/v1/users' );