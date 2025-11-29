<template>
  <section class="panel contact">
    <h2 class="panel__title">Contact Us</h2>

    <form class="contact__form" @submit.prevent="sendMessage">
      <div class="field">
        <label for="name">Full Name</label>
        <input v-model="form.name" id="name" type="text" required />
      </div>

      <div class="field">
        <label for="email">Email</label>
        <input v-model="form.email" id="email" type="email" required />
      </div>

      <div class="field">
        <label for="message">Message</label>
        <textarea v-model="form.message" id="message" rows="4" required></textarea>
      </div>

      <pv-button type="submit" label="Send Message" icon="pi pi-send" />
    </form>

    <p v-if="submitted" class="success">✅ Message sent successfully!</p>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue'

const form = reactive({
  name: '',
  email: '',
  message: '',
})
const submitted = ref(false)

function sendMessage() {
  console.log('Form data:', form)
  submitted.value = true
  setTimeout(() => (submitted.value = false), 3000)
  form.name = ''
  form.email = ''
  form.message = ''
}
</script>

<style scoped>
.panel {
  background: var(--panel);
  padding: 24px;
  border-radius: 14px;
  box-shadow: 0 6px 20px rgba(23, 43, 77, 0.08);
  max-width: 600px;
  margin: 0 auto;
}

.panel__title {
  margin-bottom: 18px;
  color: var(--primary);
  font-size: 1.6rem;
  font-weight: 800;
  text-align: center;
}

.contact__form {
  display: grid;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

input,
textarea {
  border: 1px solid #d0d7e2;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 1rem;
  font-family: inherit;
  color: var(--text);
}

input:focus,
textarea:focus {
  outline: 2px solid var(--primary);
}

.success {
  margin-top: 16px;
  color: var(--ok);
  text-align: center;
  font-weight: 600;
}
</style>
