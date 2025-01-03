<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { useCounterStore } from '@/stores/counter'
import { useUserStore } from '@/stores/user'
import { useAuth0 } from '@auth0/auth0-vue'
import HelloWorld from './components/HelloWorld.vue'
import TopHeader from './components/TopHeader.vue'
import ActionsBlock from './components/ActionsBlock.vue'
import EditView from './views/EditView.vue'

const counterStore = useCounterStore()
const userStore = useUserStore()
const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0()

userStore.fetchUserData()
</script>

<template>
  <TopHeader/>
  <!-- <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" /> -->
  <!-- <div class="wrapper">

    <nav>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/about">About</RouterLink>
    </nav>
  </div> -->

  <RouterView />
   <!-- <EditView /> -->

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
