<template>
    <nav class="nav">
        <ul id="actions">
            <li v-if="isAuthenticated">
                <h1><RouterLink :to="{ path: '/edit'}" >New</RouterLink></h1>
            </li>
            <li v-if="isAuthenticated">
                <h1>Stats</h1>
            </li>
            <li v-if="isAuthenticated">
                <h1><RouterLink :to="{ path: '/friends'}" >Friends</RouterLink></h1>
            </li>
            <li v-if="!isAuthenticated">
                <button @click="loginWithRedirect"><h1>Login</h1></button>
            </li>
        </ul>
    </nav>
</template>

<script setup>
    import { useAuth0 } from '@auth0/auth0-vue'
    const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0()
</script>

<style scoped>
    #actions {
        background: inherit;
        backdrop-filter: blur(10px);

        border-top: solid 2px white;

        position: fixed;
        bottom: 0;
        width: 100%;
        box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1), 0 2px 5px rgba(0, 0, 0, 0.1);
        z-index: 1000;

        display: flex;
        justify-content: space-around;
        align-items: center;
    }
</style>
