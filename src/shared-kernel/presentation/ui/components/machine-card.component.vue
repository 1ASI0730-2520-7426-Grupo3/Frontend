<template>
  <!-- MODIFICACIÓN 1: Añadir @click para emitir el evento 'select-machine' junto con el ID. -->
  <div class="card" @click="$emit('select-machine', machineId)">
    <img :src="img" alt="" class="card__img" />
    <div class="card__body">
      <div class="card__title">{{ title }}</div>
      <div v-if="subtitle" class="card__subtitle" :class="{ 'card__subtitle--price': isPrice }">
        {{ subtitle }}
      </div>
    </div>
  </div>
</template>

<script setup>
// MODIFICACIÓN 2: Añadir machineId a las props para que el componente padre lo pase.
defineProps({
  img: String,
  title: String,
  subtitle: String,
  isPrice: Boolean,
  machineId: [Number, String], // El ID necesario para la navegación
})
// MODIFICACIÓN 3: Declarar el evento que se emitirá al hacer clic.
defineEmits(['select-machine'])
</script>

<style scoped>
.card {
  background: var(--card);
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(23, 43, 77, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 10px;
  /* MODIFICACIÓN 4: Añadir interactividad visual */
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-3px); /* Efecto de elevación al pasar el mouse */
  box-shadow: 0 10px 30px rgba(23, 43, 77, 0.15);
}

.card__img {
  width: 100%;
  height: 160px;
  object-fit: contain;
}
.card__body {
  padding: 6px 8px 10px;
}
.card__title {
  font-weight: 700;
}
.card__subtitle {
  margin-top: 6px;
  font-weight: 600;
}
.card__subtitle--price {
  color: var(--warn);
}
</style>
