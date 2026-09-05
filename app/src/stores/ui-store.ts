"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { getSafeBrowserStorage } from "@/lib/safe-storage";

interface UiState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    {
      name: "pathpilot-ui-v1",
      version: 1,
      storage: createJSONStorage(getSafeBrowserStorage),
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
    },
  ),
);
