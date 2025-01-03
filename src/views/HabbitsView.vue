<template>
    <div class="habbits-container">
        <div v-for="habbit in habbits" :key="habbit._id">
            <SingleHabbit :habbit="habbit" />
        </div>
        <div>
            Habbits number: {{  habbits.length }}
        </div>
    </div>
</template>

<script setup>
    import SingleHabbit from '@/components/SingleHabbit.vue'
    import { useHabbitStore } from '@/stores/habbit'
    import { storeToRefs } from 'pinia'

    const habbitStore = useHabbitStore()
    habbitStore.fetchHabbitsData().then(() => {
        console.log('Habbits fetched:', habbitStore.habbits.length)
    })
    const { habbits } = storeToRefs(habbitStore)

</script>
<style scoped>
    div.habbits-container {
        margin-top: var(--top-header-height);

        display: flex;
        flex-direction: column;
        flex-wrap: wrap;

        align-content: center;
        justify-content: center;
        
        /* height: 100vh; */
        overflow-y: auto;
        font-size: 20px;
    }
</style>