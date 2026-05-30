import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserDTO } from "@shared/types/api";

type Theme = "light" | "dark" | "system";

interface AuthSlice {
  user: UserDTO | null;
  isAuthenticated: boolean;
  setUser: (user: UserDTO) => void;
  clearUser: () => void;
}

interface UiSlice {
  sidebarOpen: boolean;
  locale: "en" | "id";
  theme: Theme;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setLocale: (locale: "en" | "id") => void;
  setTheme: (theme: Theme) => void;
}

type StoreState = AuthSlice & UiSlice;

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      // Auth slice
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: true }),
      clearUser: () => set({ user: null, isAuthenticated: false }),

      // UI slice
      sidebarOpen: false,
      locale: "id",
      theme: "system",
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setLocale: (locale) => set({ locale }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "credchain-store",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        locale: state.locale,
        theme: state.theme,
      }),
    },
  ),
);
