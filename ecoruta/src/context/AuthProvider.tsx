import { type ReactNode, useState } from "react";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [nombre, setNombre] = useState('');
    const [es_admin, setEs_admin] = useState(false);
    return (
        <AuthContext.Provider value={{ nombre, setNombre, es_admin, setEs_admin }}>
            {children}
        </AuthContext.Provider>
    )
}