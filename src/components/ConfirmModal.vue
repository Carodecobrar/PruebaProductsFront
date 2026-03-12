<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
      <div class="mt-3 text-center">
        <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
          Confirmar Compra
        </h3>

        <div class="mb-4 text-left">
          <p class="text-sm text-gray-600">Producto: <span class="font-semibold">{{ product.name }}</span></p>
          <p class="text-sm text-gray-600 mt-1">Precio: <span class="font-semibold">${{ product.price.toFixed(2) }}</span></p>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 text-left mb-1">
            Cantidad
          </label>
          <input
            v-model.number="quantity"
            type="number"
            min="1"
            class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            :class="{ 'border-red-500': error }"
          />
          <p v-if="error" class="text-red-500 text-xs mt-1">{{ error }}</p>
        </div>

        <div class="flex justify-end space-x-3">
          <button
            @click="$emit('cancel')"
            class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            @click="confirm"
            :disabled="loading"
            class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {{ loading ? 'Procesando...' : 'Confirmar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  product: any
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'confirm', quantity: number): void
  (e: 'cancel'): void
}>()

const quantity = ref(1)
const error = ref('')

watch(quantity, () => {
  if (quantity.value < 1) {
    quantity.value = 1
  }
})

const confirm = () => {
  if (!quantity.value || quantity.value < 1) {
    error.value = 'La cantidad debe ser mayor a 0'
    return
  }
  emit('confirm', quantity.value)
}
</script>
