import type { StateStorage } from "zustand/middleware";

const serverStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

export function getSafeBrowserStorage(): StateStorage {
  if (typeof window === "undefined") return serverStorage;

  return {
    getItem(name) {
      try {
        return window.localStorage.getItem(name);
      } catch {
        return null;
      }
    },
    setItem(name, value) {
      try {
        window.localStorage.setItem(name, value);
      } catch {
        // Persistence is an enhancement; in-memory state remains usable.
      }
    },
    removeItem(name) {
      try {
        window.localStorage.removeItem(name);
      } catch {
        // A blocked storage backend should never break the active session.
      }
    },
  };
}
