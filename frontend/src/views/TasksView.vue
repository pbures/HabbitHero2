<template>
    <div class="habbits-container">
        <div v-if="!selectedHabbit" v-for="habbit in habbits" :key="habbit._id" class="task-container">
            <SingleHabbit :habbit="habbit" @update-habbit-detail="(h) => {toggleTaskStatistics(h)}"/>
        </div>

        <div v-if="selectedHabbit">
            <StatisticsView :habbit="selectedHabbit" @close-statistics="closeStatistics()"/>
        </div>
    </div>
</template>

<script setup>
    import SingleHabbit from '@/components/SingleTask.vue'
    import StatisticsView from '@/components/StatisticsView.vue'
    import { useHabbitStore } from '@/stores/task'
    import { storeToRefs } from 'pinia'
    import { ref } from 'vue'

    const habbitStore = useHabbitStore()
    habbitStore.fetchHabbitsData().then(() => {
        console.log('Habbits fetched:', habbitStore.habbits.length)
    })
    const { habbits } = storeToRefs(habbitStore);
    let selectedHabbit = ref(null);

    console.log('Habbits num:', habbits.length);

    function toggleTaskStatistics(habbit) {
        selectedHabbit.value = selectedHabbit.value === null ? habbit : null;
    }

    function closeStatistics () {
        selectedHabbit.value = null;
    }

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
