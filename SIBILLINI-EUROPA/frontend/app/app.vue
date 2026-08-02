<script setup>
import siteContent from "./content/site.json";
</script>

<template>
  <NuxtRouteAnnouncer />
  <main class="page-shell">
    <section class="hero">
      <p class="kicker">{{ siteContent.hero.kicker }}</p>
      <h1>{{ siteContent.hero.title }}</h1>
      <p>
        {{ siteContent.hero.subtitle }}
      </p>
    </section>

    <section class="panel">
      <h2>Focus del sito</h2>
      <ul class="highlights">
        <li v-for="item in siteContent.highlights" :key="item.title" class="card">
          <h3>{{ item.title }}</h3>
          <p>{{ item.description }}</p>
        </li>
      </ul>
    </section>

    <section class="panel">
      <h2>Contatti</h2>
      <p>Email: {{ siteContent.contacts.email }}</p>
      <p>Localita: {{ siteContent.contacts.city }}</p>
    </section>
  </main>
</template>

<style scoped>
.page-shell {
  max-inline-size: 960px;
  margin: 0 auto;
  padding: 2rem 1rem 4rem;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  color: #1a1d24;
}

.hero {
  margin-block-end: 1.5rem;
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
  margin-block-end: 1rem;
}

.highlights {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.75rem;
  padding: 0;
  margin: 0;
}

.card {
  border: 1px solid #e3e7f0;
  border-radius: 8px;
  padding: 0.75rem;
}

.card h3 {
  margin: 0 0 0.4rem;
}

.card p {
  margin: 0;
}
</style>
