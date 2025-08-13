import { createContext } from "react";

interface ContexUser {
    nombre: string;
    setNombre: (nombre: string) => void
    es_admin: boolean;
    setEs_admin: (es_admin: boolean) => void
}

export const AuthContext = createContext<ContexUser>({
    nombre: "",
    setNombre: (nombre: string) => nombre,
    es_admin: false,
    setEs_admin: (es_admin: boolean) => es_admin,
})