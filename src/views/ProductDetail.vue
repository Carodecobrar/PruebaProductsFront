<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <router-link to="/" class="text-indigo-600 hover:text-indigo-900">
              ← Volver a productos
            </router-link>
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
      <!-- Loading -->
      <div v-if="store.loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p class="mt-2 text-gray-600">Cargando producto...</p>
      </div>

      <!-- Error -->
      <div v-else-if="store.error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {{ store.error }}
      </div>

      <!-- Producto -->
      <div v-else-if="product" class="bg-white rounded-lg shadow-lg overflow-hidden">
        <div class="md:flex">
          <div class="md:flex-1 p-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-4">{{ product.name }}</h1>

            <div class="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p class="text-sm text-gray-600">SKU</p>
                <p class="font-semibold">{{ product.sku }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Precio</p>
                <p class="text-2xl font-bold text-indigo-600">${{ product.price.toFixed(2) }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Estado</p>
                <span
                  class="px-2 py-1 text-xs rounded inline-block mt-1"
                  :class="product.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                >
                  {{ product.status }}
                </span>
              </div>
              <div>
                <p class="text-sm text-gray-600">Inventario</p>
                <div v-if="inventoryLoading" class="text-sm text-gray-500">Cargando...</div>
                <div v-else-if="inventoryError" class="text-sm text-red-500">Error al cargar</div>
                <div v-else-if="inventory" class="text-sm">
                  <p>Disponible: <span class="font-semibold">{{ inventory.available - inventory.reserved }}</span></p>
                  <p class="text-xs text-gray-500">Reservado: {{ inventory.reserved }}</p>
                </div>
                <div v-else class="text-sm text-gray-500">Sin información</div>
              </div>
            </div>

            <button
              @click="openPurchaseModal"
              :disabled="store.purchasing"
              class="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {{ store.purchasing ? 'Procesando...' : 'Comprar ahora' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Último resultado de compra (para reintento) -->
      <div v-if="store.lastPurchaseResult && !store.lastPurchaseResult.success"
           class="mt-6 bg-yellow-50 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        <div class="flex justify-between items-center">
          <span>❌ Error: {{ store.lastPurchaseResult.message }}</span>
          <button
            @click="retryPurchase"
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
      :product="product"
      :loading="store.purchasing"
      @confirm="handlePurchase"
      @cancel="closeModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductsStore } from '../stores/products'
import { useAuthStore } from '../stores/auth'
import ConfirmModal from '../components/ConfirmModal.vue'

const route = useRoute()
const router = useRouter()
const store = useProductsStore()
const authStore = useAuthStore()

const user = authStore.user
const product = ref<any>(null)
const inventory = ref<any>(null)
const inventoryLoading = ref(false)
const inventoryError = ref(false)
const showModal = ref(false)

onMounted(async () => {
  const id = route.params.id as string
  product.value = await store.fetchProductById(id)
})

const openPurchaseModal = () => {
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const handlePurchase = async (quantity: number) => {
  const result = await store.purchase(product.value.id, quantity)

  if (result.success) {
    alert(`✅ Compra exitosa!\nProducto: ${product.value.name}\nCantidad: ${quantity}`)
    closeModal()
  } else {
    closeModal()
  }
}

const retryPurchase = async () => {
  await store.retryPurchase()
}

const logout = () => {
  authStore.logout()
  router.push('/login')
}
</script>
