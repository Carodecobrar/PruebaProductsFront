import axios from 'axios'
import { useAuthStore } from '../stores/auth'

// Configuración desde variables de entorno
const API_PRODUCTS_URL = import.meta.env.VITE_API_PRODUCTS_URL || '/api'
const API_INVENTORY_URL = import.meta.env.VITE_API_INVENTORY_URL || '/inventory'

// Cliente para Products Service
export const apiProducts = axios.create({
  baseURL: API_PRODUCTS_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Cliente para Inventory Service
export const apiInventory = axios.create({
  baseURL: API_INVENTORY_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para agregar token JWT a Products Service
apiProducts.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`
  }
  return config
})

// Interceptor para manejar errores 401 (token expirado)
apiProducts.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore()
      authStore.logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
