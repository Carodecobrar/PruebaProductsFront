import axios from 'axios'
import { useAuthStore } from '../stores/auth'

// Configuración desde variables de entorno
const API_PRODUCTS_URL = import.meta.env.VITE_API_PRODUCTS_URL || '/api'
const API_INVENTORY_URL = import.meta.env.VITE_API_INVENTORY_URL || '/inventory'

// Cliente único para Products Service (maneja tanto auth como productos)
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
// EXCEPTO para la ruta de login
apiProducts.interceptors.request.use((config) => {
  const authStore = useAuthStore()

  // No agregar token a la ruta de login
  if (config.url?.includes('/login')) {
    return config
  }

  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`
  }
  return config
})

// Interceptor para manejar errores 401 (token expirado)
apiProducts.interceptors.response.use(
  response => response,
  error => {
    // No redirigir en errores de login
    if (error.config?.url?.includes('/login')) {
      return Promise.reject(error)
    }

    if (error.response?.status === 401) {
      const authStore = useAuthStore()
      authStore.logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
