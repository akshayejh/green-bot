import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { invoke } from '@tauri-apps/api/core';
import { AdbDevice, DeviceMetadata } from '@/types';

interface DeviceState {
    devices: AdbDevice[];
    selectedSerial: string;
    loading: boolean;
    error: string | null;
    deviceMetadata: Record<string, DeviceMetadata>;

    setSelectedSerial: (serial: string) => void;
    setDeviceMetadata: (serial: string, metadata: DeviceMetadata) => void;
    refreshDevices: () => Promise<void>;
}

export const useDeviceStore = create<DeviceState>()(
    persist(
        (set) => ({
            devices: [],
            selectedSerial: "",
            loading: false,
            error: null,
            deviceMetadata: {},

            setSelectedSerial: (serial) => set({ selectedSerial: serial }),
            setDeviceMetadata: (serial, metadata) =>
                set((state) => ({
                    deviceMetadata: {
                        ...state.deviceMetadata,
                        [serial]: { ...state.deviceMetadata[serial], ...metadata }
                    }
                })),

            refreshDevices: async () => {
                set({ loading: true, error: null });
                try {
                    const devices = await invoke<AdbDevice[]>("get_adb_devices");

                    set((state) => {
                        const currentSerial = state.selectedSerial;
                        let newSerial = currentSerial;

                        // If we have devices
                        if (devices.length > 0) {
                            // Check if current selection is still valid
                            const stillConnected = devices.find(d => d.serial === currentSerial);

                            if (!stillConnected) {
                                // If not valid, default to first one
                                newSerial = devices[0].serial;
                            } else if (!currentSerial) {
                                // If nothing selected but we have devices, select first
                                newSerial = devices[0].serial;
                            }
                        } else {
                            // No devices connected
                            // newSerial = ""; // Optionally clear selection?
                        }

                        return { devices, loading: false, selectedSerial: newSerial };
                    });
                } catch (err) {
                    console.error(err);
                    set({ error: String(err), devices: [], loading: false });
                }
            },
        }),
        {
            name: 'device-storage', // name of the item in the storage (must be unique)
            storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
            partialize: (state) => ({ selectedSerial: state.selectedSerial }), // only persist selectedSerial
        }
    )
);
