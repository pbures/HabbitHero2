<template>
    <header class="header">
        <h1 class="title" @click="redirect" >Habbit Hero</h1>
        <h1>{{  userStore.name }}</h1>
        <nav class="nav">
            <ul>
                <li v-if="isAuthenticated">
                    <h1 @click="logout()">Logout</h1>
                </li>
                <li v-if="!isAuthenticated">
                    <button @click="loginWithRedirect"><h1>Login</h1></button>
                </li>
            </ul>
        </nav>
    </header>
</template>

<script setup>
  import { useUserStore } from '@/stores/user_legacy'
import { useAuth0 } from '@auth0/auth0-vue'

  const userStore = useUserStore()
  const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0()

  userStore.fetchUserData()

  import { useRouter } from 'vue-router'

  const router = useRouter()

  function redirect() {
    router.push('/')
  }

</script>

<style scoped>
.header {
    /* background-color: var(--vt-c-black-mute); */
    background: inherit;
    backdrop-filter: blur(10px);

    border-bottom: 1px solid white;
    max-height: var(--top-header-height);

    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 1000;
    /* box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1), 0 2px 5px rgba(0, 0, 0, 0.1); */
    box-shadow: 3px 3px 5px #1b2d3d;
  }

  .header h1 {
    color: rgb(255, 255, 255);
    font-size: 1.5em;
  }

  .title {
    font-size: 1.5em;
    cursor: pointer;
  }

</style>
