<template>
    <div>

        <!-- <code>
            {{ 
            JSON.stringify(habbits) 
        }}
        </code> -->

        <div class="habbits-container">
            <div>
                Home View with a list of habbits.
                Habbits: {{ habbitLen }}
            </div>
            <div class="habbit" v-for="habbit in habbits" :key="habbit.id">
                <h3>{{ habbit.title }}</h3>
            </div>
        </div>

    </div>
</template>
<script setup>
    import { useHabbitStore } from '@/stores/habbit'
    import { computed } from 'vue'
    import { storeToRefs } from 'pinia'

    const habbitStore = useHabbitStore()
    habbitStore.fetchHabbitsData()
    const { habbits } = storeToRefs(habbitStore)
    const habbitLen = computed(() => habbits.value.length)

</script>
<style scoped>
    div.habbits-container {
        margin-top: var(--top-header-height);

        display: flex;
        flex-direction: row;
        flex-wrap: wrap;

        align-items: flex-start;
        align-content: flex-start;
        justify-content: center;
        
        height: 100vh;
        font-size: 20px;
    }

    div.habbit {
        border: solid 2px black;
        margin: 1em;
        padding: 8px;
        max-width: 200px;
    }
</style>