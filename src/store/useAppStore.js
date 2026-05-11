import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAppStore = create(
  persist(
    (set) => ({
      // App State
      hasCompletedOnboarding: false,
      setHasCompletedOnboarding: (val) => set({ hasCompletedOnboarding: val }),
      
      // Theme & Language
      isDarkMode: true,
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      language: 'en',
      setLanguage: (lang) => set({ language: lang }),
      
      // User Profile
      userName: '',
      setUserName: (name) => set({ userName: name }),
      bloodGroup: '',
      setBloodGroup: (bg) => set({ bloodGroup: bg }),
      vehicleInfo: { type: '', regNumber: '', insurance: '' },
      setVehicleInfo: (info) => set({ vehicleInfo: info }),
      medicalProfile: {
        allergies: [],
        medications: [],
        conditions: [],
        directive: '',
        nextOfKin: { name: '', phone: '' },
        aiSummary: ''
      },
      setMedicalProfile: (profile) => set((state) => ({
        medicalProfile: { ...state.medicalProfile, ...profile }
      })),
      lastTriage: null,
      setLastTriage: (triage) => set({ lastTriage: triage }),
      sosDraft: '',
      setSosDraft: (draft) => set({ sosDraft: draft }),
      tremorMode: false,
      setTremorMode: (status) => set({ tremorMode: status }),
      voiceOptIn: false,
      setVoiceOptIn: (status) => set({ voiceOptIn: status }),
      glanceMode: false,
      setGlanceMode: (status) => set({ glanceMode: status }),
      
      // Emergency Contacts
      emergencyContacts: [],
      addEmergencyContact: (contact) => set((state) => ({
        emergencyContacts: [...state.emergencyContacts, { ...contact, id: Date.now() }].slice(0, 5)
      })),
      removeEmergencyContact: (id) => set((state) => ({
        emergencyContacts: state.emergencyContacts.filter(c => c.id !== id)
      })),
      
      // Location
      location: null,
      locationAccuracy: null,
      setLocation: (lat, lng, accuracy) => set({ location: { lat, lng }, locationAccuracy: accuracy }),
      
      // SOS State
      isSosActive: false,
      sosStartTime: null,
      triggerSos: () => set({ isSosActive: true, sosStartTime: Date.now() }),
      cancelSos: () => set({ isSosActive: false, sosStartTime: null }),
      
      // Network & Data
      isOnline: navigator.onLine,
      setIsOnline: (status) => set({ isOnline: status }),
      
      // Country
      countryCode: 'IN', // Default
      setCountryCode: (code) => set({ countryCode: code }),
    }),
    {
      name: 'roadsos-storage',
      partialize: (state) => ({
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        isDarkMode: state.isDarkMode,
        language: state.language,
        userName: state.userName,
        bloodGroup: state.bloodGroup,
        vehicleInfo: state.vehicleInfo,
        medicalProfile: state.medicalProfile,
        lastTriage: state.lastTriage,
        sosDraft: state.sosDraft,
        tremorMode: state.tremorMode,
        voiceOptIn: state.voiceOptIn,
        glanceMode: state.glanceMode,
        emergencyContacts: state.emergencyContacts,
        countryCode: state.countryCode
      })
    }
  )
)
