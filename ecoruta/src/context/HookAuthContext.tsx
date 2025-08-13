import { useContext } from "react";
import { AuthContext } from "./AuthContext";

const authUser = () => {
    return useContext(AuthContext)
}

export default authUser