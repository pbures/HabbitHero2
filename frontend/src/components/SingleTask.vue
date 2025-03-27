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
            <div class="clickable" @click="confirmEvent(habbit._id)" id="add-progress">
              &#x2713;
            </div>
            <div class="clickable" @click="removeEvents(habbit._id)" id="add-progress">
              X
            </div>
            <div id="edit" class="clickable"><RouterLink :to="{ path: '/edit', query: { taskId:habbit._id } }" >E</RouterLink>
            </div>
            <div id="show-info" class="clickable" @click="showTaskStatistics(habbit)">&#9432;</div>
            <div id="delete" class="clickable" @click="deleteHabbit(habbit._id)">&#x1F5D1;</div>
            <div id="invite" class="clickable" @click="toggleFriendsList()">&#x1F465;</div>
          </div>

        <div v-if="habbit.type=='habbit'" class="habbit-stats">
          <div
            v-for="he, i in habbitEvents"
            :key="he.date"
            class="habbit-stat"
            :class="habbitStatClass(he.hit)"
            :alt="getDayMonthStr(he.date)"
            @click="focusedEvent=i"
          >
          <div v-if="i == focusedEvent" class="habbit-event-detail"> {{ getDayMonthStr(he.date) }}</div>
        </div>
        </div>
        <div v-else class="habbit-stats">
          <div :style="{ width: goalLeftWidth }" class="habbit-goal-stat-left" />
          <div :style="{ width: goalRightWidth }" class="habbit-goal-stat-right" />
        </div>

        <div v-if="showFriendsList" class="friends-list">
          <div v-for="f in user.friends" :key="f.id" class="friend">
            <div>{{ userIdToNickname(f) }}
              <em class="clickable" @click="inviteFriend(f, habbit._id)">
                &#x2192;
              </em>
            </div>
          </div>
        </div>


    </div>
</template>

<script setup>
import { useHabbitStore } from '@/stores/task';
import { useUserStore } from '@/stores/user';
import { storeToRefs } from 'pinia';

import { findPreviousDays, getDateStr, getDayMonthStr } from '@/utils/findDates';
import { computed, ref, toRefs } from 'vue';

    const props = defineProps(['habbit','selectedHabbit']);
    const emit = defineEmits(['update-habbit-detail']);

    let {habbit, selectedHabbit} = toRefs(props);

    const days = ref(findPreviousDays(new Date(), habbit.value.days_in).reverse());
    const habbitEvents = computed( () => { return getHabbitEvents(habbit.value) });
    const focusedEvent = ref(null);

    const goalLeftWidth = computed( () => {
      return `${goalWidthPercentage()}%`;
    });

    const goalRightWidth = computed( () => {
      return `${100 - goalWidthPercentage()}%`;
    });

    function goalWidthPercentage() {
      return Math.floor(habbit.value.total_event_count * 100 / habbit.value.target);
    }

    function getHabbitEvents(h){
      if (h.days_in.length == 0) return [];

      const ret = days.value.map( (m) => {
        return {date: m, hit: isEventInDates(m, h.events)}
      });
      return ret;
    }

    function isEventInDates(eDate, dates) {
      const ret = dates.some( (d) => {
        const r = getDateStr(new Date(d.date)) === getDateStr(eDate);
        return r;
      })

      return ret;
    }

    function inviteFriend(nickname, habbit_id) {
      console.log(`Invite friend: ${nickname} to habbit with id: ${habbit_id}`);
    }

    const habbitStore = useHabbitStore()

    const showFriendsList = ref(false);
    const userStore = useUserStore()
    const { user, error, exists } = storeToRefs(userStore);

    const toggleFriendsList = () =>{
      showFriendsList.value = !showFriendsList.value;
      console.log('Toggle friends list:', showFriendsList.value);
    }

    function userIdToNickname(userId) {
      return userStore.userIdtoNickname(userId);
    }

    function habbitStatClass(eventDone){
      return eventDone?"event-met":"event-not-met";
    }

    const confirmEvent = (id) => {
        console.log('Event confirmed for habbit with id:', id);
        if (habbit.value.total_event_count >= habbit.value.target) {
          return;
        }

        let date = new Date();
        if (focusedEvent.value != null) {
          date = new Date(days.value[focusedEvent.value])
        }

        habbitStore.addHabbitsEvent(id, date)
    };

    const removeEvents = (id) => {
      const dateToRemove = days.value[focusedEvent.value]
      console.log(`Events for event: ${id} confirmed for removal with dates: `, dateToRemove);

      habbitStore.removeHabbitsFromEvent(id, dateToRemove)
    }

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
      padding-bottom: 5px;
    }

    .habbit-stat {
      border: 1px black solid;
      width: 100%;
      margin: 5px;
      max-height: 8px;
      padding-top: 5px;
    }

    .event-met {
      background-color: green;
    }

    .event-not-met {
      background-color: red;
    }

    .habbit-event-detail {
      font-size: 0.7em;
      white-space: nowrap;
    }

    .habbit-goal-stat-left {
      border: solid 1px black;
      background-color: green;
      /* width: 60%; */
      height: 12px;
      margin-top: 4px;
    }

    .habbit-goal-stat-right {
      border: solid 1px black;
      background-color: red;
      /* width: 40%; */
      height: 12px;
      margin-top: 4px;
    }
</style>
