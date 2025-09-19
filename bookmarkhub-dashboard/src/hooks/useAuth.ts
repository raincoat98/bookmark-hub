import { createContext, useContext } from "react";
import type { User } from "firebase/auth";

export type AuthState = { user: User | null; loading: boolean };
export const AuthCtx = createContext<AuthState>({ user: null, loading: true });

export function useAuth() {
  return useContext(AuthCtx);
}
