import { defineStore } from 'pinia'
import { apiProducts } from '../services/api'  // ← Usa el mismo cliente

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user') || 'null')
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    getUser: (state) => state.user
  },

  actions: {
    async login(email: string, password: string) {
      try {
        // Usa apiProducts para login (el interceptor no agregará token)
        const response = await apiProducts.post('/auth/login', {
          email,
          password
        })

        this.token = response.data.token
        this.user = {
          email: response.data.email,
          role: response.data.role
        }

        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(this.user))

        return { success: true }
      } catch (error: any) {
        const message = error.response?.data?.errors?.[0]?.detail || 'Error de autenticación'
        return { success: false, message }
      }
    },

    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }
})
