import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "dark" | "light" | "system";

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  profileImage: string | null;
  setProfileImage: (url: string | null) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: "dark",
      setTheme: (theme) => set({ theme }),
      profileImage: null,
      setProfileImage: (url) => set({ profileImage: url }),
    }),
    { name: "pythia-theme" }
  )
);
