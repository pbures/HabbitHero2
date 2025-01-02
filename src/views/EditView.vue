<script setup>
import { ref } from 'vue';
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useHabbitStore } from '@/stores/habbit'
import { useRouter } from 'vue-router';

const habbitStore = useHabbitStore();
const task = ref({});
const router = useRouter();
const route = useRoute();

onMounted(() => {
    const taskId = route.query.taskId;
    console.log(route.query)
    console.log("taskId: ", taskId);
    if (taskId) {
        //Fetch the data for task with taskId
        // habbitStore.getHabbitById(taskId)
        habbitStore.fetchHabbitsData().then(() => {
            task.value = habbitStore.getHabbitById(taskId)
            console.log("TV:",task.value);
        })
    }
});
function saveTaskData() {
    console.log(task.value);
    habbitStore.addNewHabbit(task.value)
    router.push({ path: '/'})
}

</script>


<template>
    <form class="edit-container">
        <div>
            <label for="taskName">Task Title:</label>
            <input type="text" id="taskName" v-model="task.title" required />
        </div>
        <div>
            <label for="taskDescription">Description:</label>
            <textarea id="taskDescription" v-model="task.description" required></textarea>
        </div>
         <div>
            <label for="taskType" :bind>Task type (habbit or a goal):</label>
            <select id="taskType" v-model="task.type" required>
                <!-- <option value="" disabled>Select type</option> -->
                <option value="habbit">Habbit</option>
                <option value="goal">Goal</option>
            </select>
        </div>
        <div v-if="task.type === 'goal'">
            <label for="taskRepetitions">Repetitions:</label>
            <input type='number' id="taskRepetitions" v-model="task.repetitions" required></input>
        </div>
        <div>
            <label for="taskDueDate">Due Date:</label>
            <input type="date" id="taskDueDate" v-model="task.dueDate" required />
        </div>
        <div @click="saveTaskData">Save Task</div>
    </form>
</template>

<style scoped>
    .edit-container {
       margin-top: var(--top-header-height);

        /* display: flex;
        flex-direction: column;
        flex-wrap: wrap;

        align-items: flex-start;
        align-content: flex-start;
        justify-content: center;
        
        height: 100vh;
        font-size: 20px;  */
    }
</style>