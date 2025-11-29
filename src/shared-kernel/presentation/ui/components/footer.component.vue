<template>
  <footer class="footer-container">
    <div class="footer-divider"></div>
    <div class="footer-content">
      <div class="footer-left">
        <span class="footer-text">{{ $t('footer.copyright') }}</span>
      </div>

      <div class="footer-right">
        <a
          href="#"
          @click.prevent="handleTermsClick"
          class="footer-link"
          :aria-label="$t('footer.links.terms')"
        >
          {{ $t('footer.links.terms') }}
        </a>
        <a
          href="#"
          @click.prevent="handlePrivacyClick"
          class="footer-link"
          :aria-label="$t('footer.links.privacy')"
        >
          {{ $t('footer.links.privacy') }}
        </a>
        <a
          href="#"
          @click.prevent="handleCookieClick"
          class="footer-link"
          :aria-label="$t('footer.links.cookie')"
        >
          {{ $t('footer.links.cookie') }}
        </a>
      </div>
    </div>
  </footer>
</template>

<script setup>
const handleTermsClick = () => {
  console.log('Navigate to Terms and conditions')
}

const handlePrivacyClick = () => {
  console.log('Navigate to Privacy Policy')
}

const handleCookieClick = () => {
  console.log('Navigate to Cookie Policy')
}
</script>

<style scoped>
.footer-container {
  background-color: #f8fafc;
  margin-top: auto;
}

.footer-divider {
  height: 1px;
  background-color: #0ea5e9;
  margin: 0 80px;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 80px;
}

.footer-left {
  display: flex;
  align-items: center;
}

.footer-text {
  color: #0ea5e9;
  font-size: 0.875rem;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 3rem;
}

.footer-link {
  color: #0ea5e9;
  text-decoration: none;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.footer-link:hover {
  text-decoration: underline;
}

@media (max-width: 1200px) {
  .footer-divider {
    margin: 0 60px;
  }

  .footer-content {
    padding: 1rem 60px;
  }

  .footer-right {
    gap: 2.5rem;
  }
}

@media (max-width: 1024px) {
  .footer-divider {
    margin: 0 40px;
  }

  .footer-content {
    padding: 1rem 40px;
  }

  .footer-right {
    gap: 2rem;
  }

  .footer-text {
    font-size: 0.8rem;
  }

  .footer-link {
    font-size: 0.8rem;
  }
}

@media (max-width: 768px) {
  .footer-divider {
    margin: 0 20px;
  }

  .footer-content {
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem 20px;
    text-align: center;
  }

  .footer-right {
    gap: 1.5rem;
    justify-content: center;
  }

  .footer-text {
    font-size: 0.75rem;
  }

  .footer-link {
    font-size: 0.75rem;
  }
}

@media (max-width: 640px) {
  .footer-divider {
    margin: 0 12px;
  }

  .footer-content {
    padding: 0.75rem 12px;
  }

  .footer-right {
    flex-wrap: wrap;
    gap: 1rem;
  }

  .footer-text {
    font-size: 0.7rem;
  }

  .footer-link {
    font-size: 0.7rem;
  }
}

@media (max-width: 480px) {
  .footer-content {
    padding: 0.5rem 8px;
  }

  .footer-right {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
