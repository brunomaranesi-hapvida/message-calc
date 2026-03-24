"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { isAuthenticated, clearToken } from "@/lib/auth";

interface AuthContextType {
  isLoggedIn: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checked, setChecked] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const authed = isAuthenticated();
    setIsLoggedIn(authed);
    setChecked(true);

    if (!authed && pathname !== "/login") {
      router.replace("/login");
    }
  }, [pathname, router]);

  function logout() {
    clearToken();
    setIsLoggedIn(false);
    router.replace("/login");
  }

  const shouldRenderChildren = checked && (isLoggedIn || pathname === "/login");

  return (
    <AuthContext.Provider value={{ isLoggedIn, logout }}>
      {shouldRenderChildren ? children : null}
    </AuthContext.Provider>
  );
}
