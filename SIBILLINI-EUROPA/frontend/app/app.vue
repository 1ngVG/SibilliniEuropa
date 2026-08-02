<script setup lang="ts">
const config = useRuntimeConfig();

const { data, pending, error, refresh } = await useFetch("/health", {
  baseURL: config.public.apiBase,
  server: false
});
</script>

<template>
  <NuxtRouteAnnouncer />
  <main class="page-shell">
    <section class="hero">
      <p class="kicker">Sibillini Europa</p>
      <h1>MEVN Migration Bootstrap</h1>
      <p>
        Frontend Nuxt e backend a microservizi sono inizializzati. Questa pagina
        verifica la connessione al gateway REST locale.
      </p>
    </section>

    <section class="panel">
      <header class="panel-header">
        <h2>Gateway Status</h2>
        <button type="button" @click="refresh">Aggiorna</button>
      </header>

      <p v-if="pending">Controllo in corso...</p>
      <p v-else-if="error">Errore di connessione: {{ error.message }}</p>
      <pre v-else>{{ data }}</pre>
    </section>
  </main>
</template>

<style scoped>
.page-shell {
  max-width: 960px;
  margin: 0 auto;
  padding: 2rem 1rem 4rem;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  color: #1a1d24;
}

.hero {
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  border: 1px solid #d8dde7;
  border-radius: 12px;
  background: linear-gradient(150deg, #f2f5fb 0%, #ffffff 100%);
}

.kicker {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.72rem;
  color: #3f5f99;
}

.hero h1 {
  margin: 0.35rem 0 0.8rem;
}

.panel {
  border: 1px solid #d8dde7;
  border-radius: 12px;
  padding: 1rem;
  background: #ffffff;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

button {
  border: 1px solid #7f99cb;
  background: #4f6fad;
  color: #ffffff;
  border-radius: 8px;
  padding: 0.45rem 0.7rem;
  cursor: pointer;
}

pre {
  white-space: pre-wrap;
  margin: 0;
  padding: 0.9rem;
  border-radius: 8px;
  background: #0e1729;
  color: #d7e1f7;
  overflow-x: auto;
}
</style>
