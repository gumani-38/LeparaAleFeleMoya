import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

type AuthContextValue = {
  token: string | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  setSession: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const TOKEN_KEY = "lepara.access-token";
const AuthContext = createContext<AuthContextValue | null>(null);

async function readToken() {
  return Platform.OS === "web" ? null : SecureStore.getItemAsync(TOKEN_KEY);
}

async function storeToken(token: string) {
  if (Platform.OS !== "web") {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
}

async function removeToken() {
  if (Platform.OS !== "web") {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    let active = true;
    readToken()
      .then((savedToken) => {
        if (active) setToken(savedToken);
      })
      .catch((error: unknown) => {
        console.error("Unable to restore the saved session.", error);
      })
      .finally(() => {
        if (active) setIsAuthLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const setSession = useCallback(async (nextToken: string) => {
    await storeToken(nextToken);
    setToken(nextToken);
  }, []);

  const signOut = useCallback(async () => {
    await removeToken();
    setToken(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      isAuthenticated: token !== null,
      isAuthLoading,
      setSession,
      signOut,
    }),
    [isAuthLoading, setSession, signOut, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
