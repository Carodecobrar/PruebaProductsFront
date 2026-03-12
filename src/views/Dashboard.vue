<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Navbar -->
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-semibold text-gray-900">Tienda de Productos</h1>
          </div>
          <div class="flex items-center">
            <span class="text-sm text-gray-600 mr-4">{{ user?.email }}</span>
            <button
              @click="logout"
              class="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
            >
              Salir
            </button>
          </div>
        </div>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Filtros -->
      <div class="bg-white rounded-lg shadow p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <input
              v-model="filters.search"
              type="text"
              placeholder="SKU o nombre..."
              class="w-full px-3 py-2 border rounded"
              @input="debouncedSearch"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              v-model="filters.status"
              class="w-full px-3 py-2 border rounded"
              @change="fetchProducts"
            >
              <option value="">Todos</option>
              <option value="ACTIVE">Activo</option>
              <option value="INACTIVE">Inactivo</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Ordenar por</label>
            <select
              v-model="filters.sortBy"
              class="w-full px-3 py-2 border rounded"
              @change="fetchProducts"
            >
              <option value="name">Nombre</option>
              <option value="price">Precio</option>
              <option value="createdAt">Fecha</option>
            </select>
          </div>

          <div class="flex items-end">
            <button
              @click="clearFilters"
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>

      <!-- Estados -->
      <div v-if="store.loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p class="mt-2 text-gray-600">Cargando productos...</p>
      </div>

      <div v-else-if="store.error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {{ store.error }}
      </div>

      <div v-else-if="store.products.length === 0" class="text-center py-12 bg-white rounded-lg shadow">
        <p class="text-gray-500">No hay productos disponibles</p>
      </div>

      <!-- Grid de productos -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="product in store.products"
          :key="product.id"
          class="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition"
        >
          <div class="p-4">
            <h3 class="text-lg font-semibold">{{ product.name }}</h3>
            <p class="text-gray-600 text-sm mt-1">SKU: {{ product.sku }}</p>
            <p class="text-2xl font-bold text-indigo-600 mt-2">${{ product.price.toFixed(2) }}</p>

            <div class="mt-2 flex items-center justify-between">
              <span
                class="px-2 py-1 text-xs rounded"
                :class="product.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
              >
                {{ product.status }}
              </span>

              <div class="space-x-2">
                <button
                  @click="viewDetail(product.id)"
                  class="text-indigo-600 hover:text-indigo-900 text-sm"
                >
                  Ver detalle
                </button>
                <button
                  @click="openPurchaseModal(product)"
                  :disabled="store.purchasing"
                  class="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 disabled:opacity-50"
                >
                  Comprar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Paginación -->
      <Pagination
        v-if="store.products.length > 0"
        :meta="store.meta"
        @page-change="handlePageChange"
        class="mt-6"
      />

      <!-- Último resultado de compra (para reintento) -->
      <div v-if="store.lastPurchaseResult && !store.lastPurchaseResult.success"
           class="mt-6 bg-yellow-50 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        <div class="flex justify-between items-center">
          <span>❌ Error: {{ store.lastPurchaseResult.message }}</span>
          <button
            @click="retryLastPurchase"
            class="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Reintentar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de compra -->
    <ConfirmModal
      v-if="showModal"
      :product="selectedProduct"
      :loading="store.purchasing"
      @confirm="handlePurchase"
      @cancel="closeModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProductsStore } from '../stores/products'
import { useAuthStore } from '../stores/auth'
import Pagination from '../components/Pagination.vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import debounce from 'lodash/debounce'

const router = useRouter()
const store = useProductsStore()
const authStore = useAuthStore()

const user = authStore.user
const showModal = ref(false)
const selectedProduct = ref<any>(null)

const filters = reactive({
  search: '',
  status: '',
  sortBy: 'name',
  ascending: true,
  page: 0,
  size: 6
})

const debouncedSearch = debounce(() => {
  filters.page = 0
  fetchProducts()
}, 500)

const fetchProducts = () => {
  store.fetchProducts(filters)
}

const handlePageChange = (newPage: number) => {
  filters.page = newPage
  fetchProducts()
}

const clearFilters = () => {
  filters.search = ''
  filters.status = ''
  filters.sortBy = 'name'
  filters.page = 0
  fetchProducts()
}

const viewDetail = (id: string) => {
  router.push(`/product/${id}`)
}

const openPurchaseModal = (product: any) => {
  selectedProduct.value = product
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedProduct.value = null
}

const handlePurchase = async (quantity: number) => {
  const result = await store.purchase(selectedProduct.value.id, quantity)

  if (result.success) {
    alert(`✅ Compra exitosa!\nProducto: ${selectedProduct.value.name}\nCantidad: ${quantity}`)
    closeModal()
  }
  // Si falla, el error se muestra automáticamente
}

const retryLastPurchase = async () => {
  await store.retryPurchase()
}

const logout = () => {
  authStore.logout()
  router.push('/login')
}

onMounted(() => {
  fetchProducts()
})
</script>
