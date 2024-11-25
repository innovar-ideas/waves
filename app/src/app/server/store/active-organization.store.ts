import {
  getActiveOrganizationSlugFromLocalStorage,
  setActiveOrganizationSlugInLocalStorage,
  } from "@/lib/helper-function";
  import { create } from "zustand";
  import { persist } from "zustand/middleware";
  
  interface ActiveOrganizationState {
    organizationSlug: string;
    setOrganizationSlug: (organization: string | null) => Promise<void>;
  }
  
  const useActiveOrganizationStore = create<ActiveOrganizationState>()(
    persist(
      (set) => ({
        organizationSlug: getActiveOrganizationSlugFromLocalStorage(),
        setOrganizationSlug: async (organizationSlug) => {
          set((state) => ({
            ...state,
            ...(organizationSlug ? { organizationSlug } : {}),
          }));
          setActiveOrganizationSlugInLocalStorage(organizationSlug);
        },
      }),
      { name: "active-organization" }
    )
  );
  
  export default useActiveOrganizationStore;
  