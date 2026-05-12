import { create } from 'zustand'

export const useRuntimeStore = create((set) => ({
  location: null,
  locationAccuracy: null,
  setLocation: (lat, lng, accuracy) => set({ location: { lat, lng }, locationAccuracy: accuracy }),

  isSosActive: false,
  sosStartTime: null,
  triggerSos: () => set({ isSosActive: true, sosStartTime: Date.now() }),
  cancelSos: () => set({ isSosActive: false, sosStartTime: null }),

  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  setIsOnline: (status) => set({ isOnline: status }),
}))
