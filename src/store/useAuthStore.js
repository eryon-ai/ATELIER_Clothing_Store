import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      // Mock login
      login: async (email, password) => {
        set({ isLoading: true })
        await new Promise(r => setTimeout(r, 800)) // simulate API

        if (email && password.length >= 6) {
          const user = {
            id: 'usr_1',
            email,
            name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            avatar: null,
            tier: 'Gold Member',
            points: 2840,
            joinedAt: '2023-03-15',
          }
          set({ user, isAuthenticated: true, isLoading: false })
          return { success: true }
        }

        set({ isLoading: false })
        return { success: false, message: 'Invalid credentials' }
      },

      // Mock signup
      signup: async (name, email, password) => {
        set({ isLoading: true })
        await new Promise(r => setTimeout(r, 1000))

        if (name && email && password.length >= 6) {
          const user = {
            id: `usr_${Date.now()}`,
            email,
            name,
            avatar: null,
            tier: 'New Member',
            points: 0,
            joinedAt: new Date().toISOString(),
          }
          set({ user, isAuthenticated: true, isLoading: false })
          return { success: true }
        }

        set({ isLoading: false })
        return { success: false, message: 'Please fill all fields correctly' }
      },

      logout: () => set({ user: null, isAuthenticated: false }),

      updateProfile: (data) => set(s => ({ user: { ...s.user, ...data } })),
    }),
    {
      name: 'atelier-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)

export default useAuthStore
