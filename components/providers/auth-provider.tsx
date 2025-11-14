"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User
} from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc
} from "firebase/firestore";

import {
  firebaseAuth,
  firebaseFirestore,
  googleAuthProvider
} from "@/lib/firebase/client";

export type AppUserRole = "admin" | "user";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  role: AppUserRole;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const defaultRole: AppUserRole = "user";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppUserRole>(defaultRole);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(firebaseAuth, async (nextUser) => {
      if (!active) {
        return;
      }

      setLoading(true);
      setUser(nextUser);

      if (nextUser) {
        try {
          const userRef = doc(firebaseFirestore, "users", nextUser.uid);
          const snapshot = await getDoc(userRef);

          if (snapshot.exists()) {
            const data = snapshot.data();
            const userRole = (data.role as AppUserRole | undefined) ?? defaultRole;
            setRole(userRole);

            await setDoc(
              userRef,
              {
                displayName: nextUser.displayName ?? "",
                email: nextUser.email ?? "",
                photoURL: nextUser.photoURL ?? "",
                updatedAt: serverTimestamp()
              },
              { merge: true }
            );
          } else {
            await setDoc(
              userRef,
              {
                role: defaultRole,
                displayName: nextUser.displayName ?? "",
                email: nextUser.email ?? "",
                photoURL: nextUser.photoURL ?? "",
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
              },
              { merge: true }
            );

            setRole(defaultRole);
          }
        } catch (error) {
          console.error("Failed to load user profile", error);
          setRole(defaultRole);
        }
      } else {
        setRole(defaultRole);
      }

      if (active) {
        setLoading(false);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const signInWithGoogleHandler = useCallback(async () => {
    await signInWithPopup(firebaseAuth, googleAuthProvider);
  }, []);

  const logoutHandler = useCallback(async () => {
    await signOut(firebaseAuth);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      role,
      isAdmin: role === "admin",
      signInWithGoogle: signInWithGoogleHandler,
      logout: logoutHandler
    }),
    [loading, logoutHandler, role, signInWithGoogleHandler, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
