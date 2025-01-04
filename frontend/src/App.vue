<script setup>
import { RouterView } from 'vue-router'
import { useUserStore } from '@/stores/user'
import TopHeader from './components/TopHeader.vue'
import ActionsBlock from './components/ActionsBlock.vue'

const userStore = useUserStore()

userStore.fetchUserData()
</script>

<template>
  <TopHeader/>
  <RouterView />
  <ActionsBlock />
</template>

<style scoped>

.wrapper {
  margin-top: var(--top-header-height);
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}
</style>
