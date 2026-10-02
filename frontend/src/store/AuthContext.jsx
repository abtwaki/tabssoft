import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, getAccessToken, getRefreshToken, setTokens } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!getAccessToken());

  const loadUser = useCallback(async () => {
    if (!getAccessToken()) {
      setUser(null);
      setLoading(false);
      return null;
    }
    try {
      const me = await api("/auth/me/");
      setUser(me);
      return me;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(
    async (email, password) => {
      const tokens = await api("/auth/login/", {
        method: "POST",
        auth: false,
        body: { email, password },
      });
      setTokens(tokens.access, tokens.refresh);
      return loadUser();
    },
    [loadUser]
  );

  const register = useCallback(
    async (payload) => {
      const res = await api("/auth/register/", {
        method: "POST",
        auth: false,
        body: payload,
      });
      setTokens(res.tokens.access, res.tokens.refresh);
      setUser(res.user);
      return res.user;
    },
    []
  );

  const logout = useCallback(() => {
    const refresh = getRefreshToken();
    if (refresh) {
      // Blacklist server-side so the refresh token can't mint new access tokens.
      api("/auth/logout/", { method: "POST", auth: false, body: { refresh } }).catch(() => {});
    }
    setTokens(null, null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, reload: loadUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
