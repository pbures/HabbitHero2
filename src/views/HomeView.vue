<script setup>
import HabbitsView from '@/components/HabbitsView.vue';
import { useAuth0 } from '@auth0/auth0-vue'

const { isAuthenticated } = useAuth0()
</script>

<template>
  <main v-if="isAuthenticated">
    <HabbitsView />
  </main>
</template>
