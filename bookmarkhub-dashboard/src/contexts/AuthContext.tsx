import { useEffect, useState } from "react";
import { watchAuth } from "../firebase";
import { AuthCtx, type AuthState } from "../hooks/useAuth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, loading: true });

  useEffect(() => {
    const unsub = watchAuth((user) => setState({ user, loading: false }));
    return () => unsub();
  }, []);

  return <AuthCtx.Provider value={state}>{children}</AuthCtx.Provider>;
}
