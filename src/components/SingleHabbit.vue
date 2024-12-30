<template>
    <div class="habbit">
        <div>{{ habbit.title }}</div>
        <div class="habbit-footer">
            <div class="habbit-details" v-if="habbit.type === 'goal'">
                G: {{ habbit.total_event_count }} /  {{ habbit.target }}
            </div>
            <div class="habbit-details" v-else>
                H: {{ habbit.total_event_count }}
            </div>
            <div class="clickable" @click="confirmEvent(habbit.id)">&#x2713;</div>
            <div class="clickable">&#9432;</div>
        </div>
    </div>
</template>

<script setup>
    import { useHabbitStore } from '@/stores/habbit'
    const habbitStore = useHabbitStore()

    const confirmEvent = (id) => {
        console.log('Event confirmed for habbit with id:', id);
    };

    defineProps(['habbit'])

</script>

<style scoped>
    div.habbit {
        /* border: solid 2px black; */
        margin: 1em;
        padding: 8px;
        max-width: 200px;
        box-shadow: 3px 3px 5px #1b2d3d;

        background-color: #2e79bf;
        color: black;
    }

    div.habbit-footer {
        display: flex;
        justify-content: space-between;
    }

    div.habbit-details {
        color: black;
    }
</style>