<template>
    <div class="habbit">
        <div class="title">{{ habbit.title }}</div>
        <div class="habbit-footer">
            <div class="habbit-details" v-if="habbit.type === 'goal'">
                G: {{ habbit.total_event_count }} / {{ habbit.target }}
            </div>
            <div class="habbit-details" v-else>
                H: {{ habbit.total_event_count }}
            </div>
            <div class="clickable" @click="confirmEvent(habbit._id)" id="add-progress">&#x2713;</div>
            <div id="edit" class="clickable"><RouterLink :to="{ path: '/edit', query: { taskId:habbit._id } }" >E</RouterLink>
            </div>
            <div id="show-info" class="clickable" @click="showTaskStatistics(habbit)">&#9432;</div>
            <div id="delete" class="clickable" @click="deleteHabbit(habbit._id)">&#x1F5D1;</div>
        </div>

        <div class="habbit-stats">
          <div v-for="he in habbitEvents" :key="he.date" class="habbit-stat" :class="habbitStatClass(he.hit)">
          </div>
        </div>
    </div>
</template>

<script setup>
    import { useHabbitStore } from '@/stores/task'
    import { toRefs, ref } from 'vue';
    import { findPreviousDays } from '@/utils/findDates'

    const props = defineProps(['habbit','selectedHabbit']);
    const emit = defineEmits(['update-habbit-detail']);

    let {habbit, selectedHabbit} = toRefs(props);

    const habbitEvents = getHabbitEvents(habbit.value);

    function getHabbitEvents(h){
      if (h.days_in.length == 0) return [];

      const days = findPreviousDays(new Date(), h.days_in).reverse();

      const ret = days.map( (m) => {
        return {date: m, hit: isEventInDates(m, h.events) }
      });
      return ret;
    }

    function isEventInDates(eDate, dates) {
      const ret = dates.some( (d) => {
        const r = theDateOnly(new Date(d.date)) === theDateOnly(eDate);
        console.log(`R: ${r}`);
        return r;
      })

      return ret;
    }

    function theDateOnly(dateObj) {
      const ret = `${dateObj.getFullYear()}-${dateObj.getMonth() + 1}-${dateObj.getDate()}`;
      console.log(ret);
      return ret;
    }

    const habbitStore = useHabbitStore()

    function habbitStatClass(eventDone){
      return eventDone?"event-met":"event-not-met";
    }

    const confirmEvent = (id) => {
        console.log('Event confirmed for habbit with id:', id);
        habbitStore.addHabbitsEvent(id)
    };

    const deleteHabbit = (id) => {
        habbitStore.deleteHabbit(id)
    };

    const showTaskStatistics = (habbit) => {
        console.log('SingleTask.vue: Show statistics for habbit:', habbit);
        selectedHabbit.value = habbit.value;
        emit('update-habbit-detail', habbit);
    };
</script>

<style scoped>
    div.habbit {
        /* border: solid 2px black; */
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
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

    div.habbit-stats {
      display: flex;
      flex-direction: row;
      justify-content: space-around;
      border-top: 1px white solid;
      width: 100%;
    }

    .habbit-stat {
      border: 1px black solid;
      width: 100%;
      margin: 5px;
      padding: 5px;
    }

    .event-met {
      background-color: green;
    }

    .event-not-met {
      background-color: red;
    }

</style>
