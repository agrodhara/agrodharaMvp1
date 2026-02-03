import { useContext } from "react";
import { AuthContext } from "./AuthCore";

export const useAuth = () => useContext(AuthContext);
