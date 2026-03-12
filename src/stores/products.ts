import { defineStore } from 'pinia'
import { apiProducts, apiInventory } from '../services/api'

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

interface Product {
  id: string
  sku: string
  name: string
  price: number
  status: 'ACTIVE' | 'INACTIVE'
  createdAt?: string
  updatedAt?: string
}

interface Inventory {
  productId: string
  available: number
  reserved: number
}

interface Meta {
  page: number
  size: number
  totalElements: number
  totalPages: number
}

interface CacheItem<T> {
  timestamp: number
  data: T
  params?: any
}

export const useProductsStore = defineStore('products', {
  state: () => ({
    products: [] as Product[],
    meta: {
      page: 0,
      size: 5,
      totalElements: 0,
      totalPages: 0
    } as Meta,
    currentProduct: null as Product | null,
    currentInventory: null as Inventory | null,
    loading: false,
    error: null as string | null,
    purchasing: false,
    lastPurchaseResult: null as any,
    // Caché
    cache: {
      products: { timestamp: null, data: null, params: null } as CacheItem<Product[]>,
      productDetails: {} as Record<string, CacheItem<Product>>
    }
  }),

  getters: {
    isProductsCacheValid: (state) => {
      if (!state.cache.products.timestamp) return false
      return Date.now() - state.cache.products.timestamp < CACHE_DURATION
    },
    isProductCacheValid: (state) => (id: string) => {
      const cached = state.cache.productDetails[id]
      if (!cached?.timestamp) return false
      return Date.now() - cached.timestamp < CACHE_DURATION
    }
  },

  actions: {
    // Listar productos con filtros y caché
    async fetchProducts(params: any = {}) {
      // Verificar caché
      /*const paramsKey = JSON.stringify(params)
      if (this.isProductsCacheValid &&
          JSON.stringify(this.cache.products.params) === paramsKey) {
        this.products = this.cache.products.data || []
        return
      }*/

      this.loading = true
      this.error = null

      try {
        const response = await apiProducts.get('/products', { params })

        // Transformar respuesta JSON:API
        this.products = response.data.data.map((item: any) => item.attributes)
        this.meta = response.data.meta

        // Guardar en caché
        this.cache.products = {
          timestamp: Date.now(),
          data: this.products,
          params
        }
      } catch (error: any) {
        this.error = error.response?.data?.errors?.[0]?.detail || 'Error al cargar productos'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Obtener detalle de producto (con caché)
    async fetchProductById(id: string) {
      if (this.isProductCacheValid(id)) {
        this.currentProduct = this.cache.productDetails[id].data
        return this.currentProduct
      }

      this.loading = true
      this.error = null

      try {
        const response = await apiProducts.get(`/products/${id}`)
        const product = response.data.data[0].attributes

        this.currentProduct = product

        // Guardar en caché
        this.cache.productDetails[id] = {
          timestamp: Date.now(),
          data: product
        }

        return product
      } catch (error: any) {
        this.error = error.response?.data?.errors?.[0]?.detail || 'Error al cargar el producto'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Realizar compra (con idempotencia)
    async purchase(productId: string, quantity: number) {
      this.purchasing = true

      try {
        const idempotencyKey = crypto.randomUUID()
        const response = await apiInventory.post('/purchases', {
          productId,
          quantity
        }, {
          headers: { 'Idempotency-Key': idempotencyKey }
        })

        this.lastPurchaseResult = {
          success: true,
          data: response.data,
          productId,
          quantity
        }

        return { success: true, data: response.data }
      } catch (error: any) {
        const status = error.response?.status
        const message = error.response?.data?.errors?.[0]?.detail || 'Error al procesar la compra'

        this.lastPurchaseResult = {
          success: false,
          status,
          message,
          productId,
          quantity
        }

        return { success: false, status, message }
      } finally {
        this.purchasing = false
      }
    },

    // Reintentar última compra
    async retryPurchase() {
      if (!this.lastPurchaseResult || this.lastPurchaseResult.success) return

      const { productId, quantity } = this.lastPurchaseResult
      return this.purchase(productId, quantity)
    },

    clearCache() {
      this.cache = {
        products: { timestamp: null, data: null, params: null },
        productDetails: {}
      }
    },

    clearCurrentProduct() {
      this.currentProduct = null
      this.currentInventory = null
    }
  }
})
