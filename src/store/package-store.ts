import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { AppPackage, PackageDetails } from "@/features/packages/types";

interface PackageState {
  packages: AppPackage[];
  loading: boolean;
  selectedPkg: AppPackage | null;
  details: PackageDetails | null;
  detailsLoading: boolean;

  // Actions
  fetchPackages: (deviceSerial: string, showSystem: boolean) => Promise<void>;
  fetchDetails: (deviceSerial: string, pkgId: string) => Promise<void>;
  setSelectedPkg: (pkg: AppPackage | null) => void;
  clearSelection: () => void;

  // Updates
  removePackage: (pkgId: string) => void;
  updatePackage: (pkgId: string, updates: Partial<AppPackage>) => void;
  updateDetails: (updates: Partial<PackageDetails>) => void;
}

export const usePackageStore = create<PackageState>((set) => ({
  packages: [],
  loading: false,
  selectedPkg: null,
  details: null,
  detailsLoading: false,

  fetchPackages: async (deviceSerial: string, showSystem: boolean) => {
    set({ loading: true });
    try {
      const list = await invoke<AppPackage[]>("list_packages", {
        device: deviceSerial,
        includeSystem: showSystem,
      });

      set((state) => {
        // If selected pkg is no longer in list, deselect it
        let newSelected = state.selectedPkg;
        if (newSelected && !list.find((p) => p.package_id === newSelected!.package_id)) {
          newSelected = null;
        }
        return { packages: list, loading: false, selectedPkg: newSelected };
      });
    } catch (err) {
      console.error("Failed to fetch packages", err);
      set({ packages: [], loading: false });
    }
  },

  fetchDetails: async (deviceSerial: string, pkgId: string) => {
    set({ detailsLoading: true, details: null });
    try {
      const info = await invoke<PackageDetails>("get_package_details", {
        device: deviceSerial,
        package: pkgId,
      });
      set({ details: info, detailsLoading: false });
    } catch (err) {
      console.error("Failed to fetch details", err);
      set({ details: null, detailsLoading: false });
    }
  },

  setSelectedPkg: (pkg) => {
    set({ selectedPkg: pkg });
  },

  clearSelection: () => {
    set({ selectedPkg: null, details: null });
  },

  removePackage: (pkgId) => {
    set((state) => ({
      packages: state.packages.filter((p) => p.package_id !== pkgId),
      selectedPkg: state.selectedPkg?.package_id === pkgId ? null : state.selectedPkg,
      details: state.details?.package_id === pkgId ? null : state.details,
    }));
  },

  updatePackage: (pkgId, updates) => {
    set((state) => ({
      packages: state.packages.map((p) => (p.package_id === pkgId ? { ...p, ...updates } : p)),
      selectedPkg: state.selectedPkg?.package_id === pkgId ? { ...state.selectedPkg, ...updates } : state.selectedPkg,
    }));
  },

  updateDetails: (updates) => {
    set((state) => ({
      details: state.details ? { ...state.details, ...updates } : null,
    }));
  },
}));
