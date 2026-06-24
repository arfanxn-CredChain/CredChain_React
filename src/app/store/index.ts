import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserDTO } from "@shared/types/api";

interface AuthSlice {
  user: UserDTO | null;
  isAuthenticated: boolean;
  setUser: (user: UserDTO) => void;
  clearUser: () => void;
}

interface UiSlice {
  overviewSidebarOpen: boolean;
  locale: "en" | "id";
  setOverviewSidebarOpen: (open: boolean) => void;
  toggleOverviewSidebar: () => void;
  setLocale: (locale: "en" | "id") => void;
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
      overviewSidebarOpen: false,
      locale: "id",
      setOverviewSidebarOpen: (open) => set({ overviewSidebarOpen: open }),
      toggleOverviewSidebar: () => set((s) => ({ overviewSidebarOpen: !s.overviewSidebarOpen })),
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: "credchain-store",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        locale: state.locale,
      }),
    },
  ),
);
