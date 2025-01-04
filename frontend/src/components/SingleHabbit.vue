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

            <div class="clickable" @click="confirmEvent(habbit._id)">&#x2713;</div>
            <div class="clickable"><RouterLink :to="{ path: '/edit', query: { taskId:habbit._id } }" >E</RouterLink>
            </div>
            <div class="clickable" @click="showHabbitDetails(habbit._id)">&#9432;</div>
            <div class="clickable" @click="deleteHabbit(habbit._id)">&#x1F5D1;</div>
        </div>
    </div>
</template>

<script setup>
    import { useHabbitStore } from '@/stores/habbit'
    const habbitStore = useHabbitStore()

    const confirmEvent = (id) => {
        console.log('Event confirmed for habbit with id:', id);
        habbitStore.addHabbitsEvent(id)
    };

    const editHabbit = (id) => {
        console.log('Edit habbit with id:', id);
        /* TODO: Implement edit habbit */
    };

    const deleteHabbit = (id) => {
        console.log('Delete habbit with id:', id);
        habbitStore.deleteHabbit(id)
    };

    const showHabbitDetails = (id) => {
        console.log('Show details for habbit with id:', id);
        /* TODO: Implement show habbit details */
    };

    defineProps(['habbit'])

</script>

<style scoped>
    div.habbit {
        /* border: solid 2px black; */
        display: flex;
        justify-content: space-between;
        width: 300px;
        min-height: 50px;

        margin: 1em;
        padding: 8px;

        border: 1px solid white;
        box-shadow: 3px 3px 5px #1b2d3d;
        background: inherit;
        backdrop-filter: blur(10px);
        color: black;

        border-radius: 15px;
    }

    div.habbit-footer {
        display: flex;
        flex-direction: row;
    }

    div.habbit-details {
        color: black;
    }

    .clickable {
        cursor: pointer;
        color: black;
    }
</style>
