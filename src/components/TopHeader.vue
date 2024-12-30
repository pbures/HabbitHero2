<template>
    <header class="header">
        <h1 class="title">Habbit Hero</h1>
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
    import { useUserStore } from '@/stores/user'
    import { useAuth0 } from '@auth0/auth0-vue'

    const userStore = useUserStore()
    const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0()

    userStore.fetchUserData()
</script>

<style scoped>
.header {
    background-color: var(--vt-c-black-mute);
    max-height: var(--top-header-height);
    color: white;
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 1000;
    box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1), 0 2px 5px rgba(0, 0, 0, 0.1);
}
</style>