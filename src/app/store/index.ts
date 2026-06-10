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
  dashboardSidebarOpen: boolean;
  locale: "en" | "id";
  setDashboardSidebarOpen: (open: boolean) => void;
  toggleDashboardSidebar: () => void;
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
      dashboardSidebarOpen: false,
      locale: "id",
      setDashboardSidebarOpen: (open) => set({ dashboardSidebarOpen: open }),
      toggleDashboardSidebar: () => set((s) => ({ dashboardSidebarOpen: !s.dashboardSidebarOpen })),
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
