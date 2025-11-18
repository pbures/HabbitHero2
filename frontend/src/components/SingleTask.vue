<template>
    <div class="habbit">
        <div :class="habbit.is_observer ? 'title_nickname' : 'title'">{{ habbit.title }} <span class="title_nickname" v-if="habbit.is_observer"> - {{ userIdToNickname(habbit.user_ids[0]) }}</span> </div>
        <div v-if="!showDeletionConfirmation">
          <div class="habbit-footer">
            <div class="habbit-details" v-if="habbit.type === 'goal'">
                G: {{ habbit.total_event_count }} / {{ habbit.target }}
            </div>
            <div class="habbit-details" v-else>
                H: {{ habbit.total_event_count }}
            </div>
            <div v-if="!habbit.is_observer" class="clickable" @click="confirmEvent(habbit._id)" id="add-progress">
              &#x2713;
            </div>
            <div v-if="!habbit.is_observer" class="clickable" @click="removeEvents(habbit._id)" id="remove-progress">
              X
            </div>
            <div v-if="!habbit.is_observer" id="edit" class="clickable"><RouterLink :to="{ path: '/edit', query: { taskId:habbit._id } }" >E</RouterLink>
            </div>
            <div id="show-info" class="clickable show-info-btn" @click="showTaskStatistics(habbit)">&#9432;</div>
            <div v-if="!habbit.is_observer" id="delete" class="clickable delete-btn" @click="displayDeletionConfirmation(true)">&#x1F5D1;</div>
            <div v-if="!habbit.is_observer" id="invite" class="clickable invite-btn" @click="toggleFriendsList()">&#x1F465;</div>
          </div>

          <div v-if="habbit.type=='habbit'" class="habbit-stats">
            <div
              v-for="he, i in habbitEvents"
              :key="he.date"
              class="habbit-stat"
              :class="habbitStatClass(he.hit)"
              :alt="DaysInWeekDateUtil.getDayMonthStr(he.date)"
              @click="focusedEvent=i"
            >
            <div v-if="i == focusedEvent" class="habbit-event-detail"> {{ DaysInWeekDateUtil.getDayMonthStr(he.date) }}</div>
          </div>
          </div>
          <div v-else class="habbit-stats">
            <div :style="{ width: goalLeftWidth }" class="habbit-goal-stat-left" />
            <div :style="{ width: goalRightWidth }" class="habbit-goal-stat-right" />
          </div>

          <div v-if="showFriendsList" class="friends-list">
            <div v-for="f in user.friends" :key="f.id" class="friend">
              <div>{{ userIdToNickname(f) }}
                <em v-if="!isUserInHabbit(f, habbit._id)" class="clickable" @click="shareHabbit(f, habbit._id)">
                  &#x2192;
                </em>
                <em v-else>&#x2713;</em>
              </div>
            </div>
          </div>
        </div>

        <div class="deletion-confirmation-container" v-if="showDeletionConfirmation">
          <em>Confirm the deletion</em>
          <div id="deletion-confirmation">
            <button id="deletion-yes" class="clickable" @click="deleteHabbit(habbit._id)">Yes</button>
            <button id="deletion-no" class="clickable" @click="displayDeletionConfirmation(false)">No</button>
          </div>
        </div>

    </div>
</template>

<script setup>
import { useHabbitStore } from '@/stores/task';
import { useUserStore } from '@/stores/user';
import { storeToRefs } from 'pinia';

import DaysInMonthDateUtil from '@/utils/DaysInMonthDateUtil';
import DaysInWeekDateUtil from '@/utils/DaysInWeekDateUtil';

import { computed, ref, toRefs } from 'vue';

    const props = defineProps(['habbit','selectedHabbit']);
    const emit = defineEmits(['update-habbit-detail']);

    let {habbit, selectedHabbit} = toRefs(props);
    let showDeletionConfirmation = ref(false)

    const dateUtil = computed ( () => {
      if (habbit.value.habbit_interval == 'days_in_month') {
        return new DaysInMonthDateUtil((habbit.value.days_in || []).map(d => d+1));
      } else {
        return new DaysInWeekDateUtil(habbit.value.days_in);
      }
    });
    const days = computed( () =>  { return dateUtil.value.findPreviousDays(new Date()).reverse()});

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
        const r = DaysInWeekDateUtil.getDateStr(new Date(d.date)) === DaysInWeekDateUtil.getDateStr(eDate);
        return r;
      })

      return ret;
    }

    const isUserInHabbit = (userId, habbit_id) => {
      const res = habbitStore.isUserInHabbitObservers(userId, habbit_id);
      console.log(`User: ${userId} is already in habbit with id: ${habbit_id}: ${res}`);
      return res;
    }

    function shareHabbit(userId, habbit_id) {
      console.log(`Invite friend: ${userId} to habbit with id: ${habbit_id}`);
      // habbitStore.shareHabbit(userIdToNickname(userId), habbit_id);
      habbitStore.shareHabbit(userId, habbit_id);
    }

    const habbitStore = useHabbitStore()

    const showFriendsList = ref(false);
    const userStore = useUserStore()
    const { user } = storeToRefs(userStore);

    userStore.fetchUser()

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
      // For goals, we don't need a specific date - just remove the last event
      if (habbit.value.type === 'goal') {
        habbitStore.removeHabbitsFromEvent(id, null)
        return;
      }

      // For habbits, require a focused event
      if (focusedEvent.value == null) {
        console.warn('No event focused. Please select an event to remove.');
        return;
      }
      const dateToRemove = days.value[focusedEvent.value]
      console.log(`Events for event: ${id} confirmed for removal with dates: `, dateToRemove);

      habbitStore.removeHabbitsFromEvent(id, dateToRemove)
    }

    const deleteHabbit = (id) => {
      showDeletionConfirmation.value = false
        habbitStore.deleteHabbit(id)
    };

    const displayDeletionConfirmation = (v) => {
      showDeletionConfirmation.value = v
    }

    const showTaskStatistics = (habbit) => {
        console.log('SingleTask.vue: Show statistics for habbit:', habbit);
        selectedHabbit.value = habbit.value;
        emit('update-habbit-detail', habbit);
    };
</script>

<style scoped>

    .title_nickname {
      font-size: 0.8em;
      font-style: italic;
      color: rgb(146, 146, 146);
    }

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

    #deletion-confirmation {
      display: flex;
      justify-content: space-around;
      padding: 8px;
    }

    .deletion-confirmation-container em {
      font-size: 1em;
      margin-bottom: 8px;
      border-bottom: 1px solid white;
    }

    #deletion-confirmation > button {
      background-color: rgba(255,255,255, 0.2);
      border: 1px solid rgba(255,255,255, 0.5);
      border-radius: 5px;
      padding: 5px;
      padding-left: 12px;
      padding-right: 12px;
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
