<script setup>
import Task from '@/model/task.mjs';
import { useHabbitStore } from '@/stores/task';
import { useAuth0 } from '@auth0/auth0-vue';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import DaysInMonthSelector from '@/components/DaysInMonthSelector.vue';
import DaysInWeekSelector from '@/components/DaysInWeekSelector.vue';

const { isAuthenticated } = useAuth0()
const habbitStore = useHabbitStore();

const task = ref(new Task());

const router = useRouter();
const route = useRoute();

onMounted(() => {
    const taskId = route.query.taskId;
    console.log("taskId: ", taskId);
    if (taskId) {
        habbitStore.fetchHabbitsData().then(() => {
            task.value = Object.assign({}, habbitStore.getHabbitById(taskId));

            console.log(`Task ID in Edit in onMounted`, task.value.days_in);
        })
    }
});

function updateSelectedDays(d) {
  task.value.days_in = d.value;
}

const saveTaskData = () => {
    habbitStore.addNewHabbit(task.value)
    router.push({ path: '/'})
}
</script>


<template>
    <main v-if="isAuthenticated">
        <form class="content-container grid-form">
            <div class="form-label">
                <label for="taskName">Task Title</label>
            </div>
            <div class="form-value">
                <input type="text" id="taskName" v-model="task.title" maxlength="16" required />
            </div>
            <div class="form-label">
                <label for="taskDescription">Description:</label>
            </div>
            <div class="form-value">
                <textarea id="taskDescription" v-model="task.description" required></textarea>
            </div>

            <div class="form-label">
                <label for="taskType">Task type (habbit or a goal):</label>
            </div>
            <div class="form-value">
                <select id="taskType" v-model="task.type" required>
                    <option value="habbit" selected>Habbit</option>
                    <option value="goal">Goal</option>
                </select>
            </div>

            <div v-if="task.type === 'habbit'" class="form-label">
              <label>Repeats per</label>
            </div>

            <div v-if="task.type === 'habbit'" class="form-value">
              <select id="repeatsPer" v-model="task.habbit_interval" required>
                <option value="days_in_week">Days in Week</option>
                <option value="days_in_month">Days in Month</option>
              </select>
            </div>

            <div v-if="task.type == 'habbit' && task.habbit_interval === 'days_in_week'" class="form-span2">
              <DaysInWeekSelector :selectedDays="task.days_in" @update-selected-days="(d) => { updateSelectedDays(d) }"/>
            </div>

            <div v-if="task.type == 'habbit' && task.habbit_interval === 'days_in_month'" class="form-span2">
              <DaysInMonthSelector :selectedDays="task.days_in" @update-selected-days="(d) => { updateSelectedDays(d) }"/>
            </div>

            <div v-if="task.type === 'goal'" class="form-label">
                <label for="taskRepetitions">Repetitions:</label>
            </div>
            <div v-if="task.type === 'goal'" class="form-value">
                <input type='number' id="taskRepetitions" v-model="task.target" required></input>
            </div>
            <div class="form-label">
                <label for="taskDueDate">Due Date:</label>
            </div>
            <div class="form-value">
                <input type="date" id="taskDueDate" v-model="task.expiration_date" required />
            </div>
            <div class="form-label form-span2 clickable" id="saveTaskDataAction" @click="saveTaskData">Save Task</div>
        </form>
    </main>
</template>

<style scoped>

</style>
