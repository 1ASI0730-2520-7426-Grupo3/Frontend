<template>
  <section class="panel">
    <h2 class="panel__title">My Machines</h2>

    <div v-if="isLoading" class="loading-state">
      <!-- Muestra un indicador mientras se cargan los datos -->
      <p>Cargando lista de equipos...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <!-- Muestra un mensaje de error si la carga falla -->
      <p class="text-red-500">Error al cargar las máquinas: {{ error.message }}</p>
      <button @click="fetchMyMachines" class="reload-button">Recargar</button>
    </div>

    <div v-else class="cards">
      <!-- Itera sobre las máquinas obtenidas de forma asíncrona -->
      <MachineCard
        v-for="m in myMachines"
        :key="m.id"
        :img="m.img"
        :title="m.name"
        :machineId="m.id"
        @select-machine="goToControls"
      />
      <p v-if="myMachines.length === 0" class="no-machines-message">
        No tienes máquinas asignadas.
      </p>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
// Importa la función 'http' simulada
import { http } from '@/shared-kernel/infrastructure/http'
import MachineCard from '@/shared-kernel/presentation/ui/components/machine-card.component.vue'

const router = useRouter()

// --- Estados Reactivos ---
const myMachines = ref([])
const isLoading = ref(true)
const error = ref(null)

// IDs de las máquinas que quieres mostrar (simulando una lista filtrada por el usuario)
const machineIdsToShow = [1, 2, 3, 4]

// --- Funciones de Lógica ---

/**
 * Carga la lista de máquinas simulando una llamada HTTP GET.
 */
const fetchMyMachines = async () => {
  isLoading.value = true
  error.value = null
  myMachines.value = []

  try {
    // 1. Simula una llamada GET a la colección 'equipments'
    const response = await http.get('/equipments')

    // **CORRECCIÓN CLAVE:** Extraer el array de datos de la propiedad 'data'
    const equipmentArray = response.data || [];

    // 2. Filtra y mapea la respuesta
    const filteredMachines = equipmentArray
      .filter((e) => machineIdsToShow.includes(e.id))
      .map((e) => ({
        id: e.id,
        name: e.name,
        // Asume que las imágenes están en el campo 'image'
        img: e.image || 'https://placehold.co/400x300/4169e1/ffffff?text=No+Image',
        model: e.model,
      }))

    myMachines.value = filteredMachines
  } catch (err) {
    console.error('Error fetching machines:', err)
    error.value = err
  } finally {
    isLoading.value = false
  }
}

/**
 * Función para manejar el clic y navegar al control de la máquina.
 */
const goToControls = (machineId) => {
  console.log(`Navigating to controls for machine ID: ${machineId}`)
  router.push({
    name: 'MachineControls', // Nombre de la ruta para MachineControlsPage
    params: { id: machineId },
  })
}

// Carga las máquinas al montar el componente
onMounted(() => {
  fetchMyMachines()
})
</script>

<style scoped>
/* Estilos existentes */
.panel {
  background: white; /* Usando blanco para visibilidad */
  padding: 25px;
  border-radius: 14px;
  box-shadow: 0 6px 20px rgba(23, 43, 77, 0.08);
}

.panel__title {
  margin-bottom: 20px;
  color: #3b82f6; /* Usando un color primario (azul) */
  font-size: 1.8rem;
  font-weight: 700;
  border-bottom: 2px solid #f3f4f6;
  padding-bottom: 10px;
}

.cards {
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

/* Estilos para estados de carga/error */
.loading-state,
.error-state,
.no-machines-message {
  text-align: center;
  padding: 40px 20px;
  font-size: 1.1rem;
  color: #6b7280;
}

.error-state p {
  margin-bottom: 15px;
  font-weight: 600;
  color: #ef4444;
}

.reload-button {
  background-color: #3b82f6;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  transition: background-color 0.3s;
}

.reload-button:hover {
  background-color: #1d4ed8;
}

.no-machines-message {
  grid-column: 1 / -1;
  font-style: italic;
  padding: 15px;
  background-color: #f9fafb;
  border-radius: 8px;
}
</style>
