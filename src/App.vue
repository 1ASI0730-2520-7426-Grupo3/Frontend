<template>
  <div class="app-container">
    <Toast />
    <ToolbarComponent v-if="!isLoginPage" />
    <main :class="isLoginPage ? 'login-content' : 'main-content'">
      <RouterView />
    </main>
    <FooterComponent v-if="!isLoginPage" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Toast from 'primevue/toast'
import ToolbarComponent from './shared-kernel/presentation/ui/components/toolbar.component.vue'
import FooterComponent from './shared-kernel/presentation/ui/components/footer.component.vue'

const route = useRoute()

const isLoginPage = computed(() => route.name === 'login')
</script>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: Arnial, sans-serif;
  color: #1f2937;
}

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  background-color: white;
  padding: 20px;
}

.login-content {
  flex: 1;
  padding: 0;
}
</style>
