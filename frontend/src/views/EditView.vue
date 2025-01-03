<script setup>
import { ref } from 'vue';
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useHabbitStore } from '@/stores/habbit'
import { useRouter } from 'vue-router';
import { useAuth0 } from '@auth0/auth0-vue'

const { isAuthenticated } = useAuth0()
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
            task.value = Object.assign({}, habbitStore.getHabbitById(taskId))
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
    <main v-if="isAuthenticated">
        <form class="edit-container">
            <div class="label">
                <label for="taskName">Task Title</label>
            </div>
            <div class="value">
                <input type="text" id="taskName" v-model="task.title" maxlength="16" required />
            </div>
            <div class="label">
                <label for="taskDescription">Description:</label>
            </div>
            <div class="value">
                <textarea id="taskDescription" v-model="task.description" required></textarea>
            </div>
            <div class="label">
                <label for="taskType" :bind>Task type (habbit or a goal):</label>
            </div>
            <div class="value">
                <select id="taskType" v-model="task.type" required>
                    <option value="habbit">Habbit</option>
                    <option value="goal">Goal</option>
                </select>
            </div>
            <div v-if="task.type === 'goal'" class="label">
                <label for="taskRepetitions">Repetitions:</label>
            </div>
            <div v-if="task.type === 'goal'" class="value">
                <input type='number' id="taskRepetitions" v-model="task.target" required></input>
            </div>
            <div class="label">
                <label for="taskDueDate">Due Date:</label>
            </div>
            <div class="value">
                <input type="date" id="taskDueDate" v-model="task.expiration_date" required />
            </div>
            <div class="label submit clickable" @click="saveTaskData">Save Task</div>
        </form>
    </main> 
</template>

<style scoped>
    .edit-container {
        margin-top: var(--top-header-height);

        display: grid;
        grid-template-columns: 1fr 1fr;
        justify-content: center;
        align-content:start;

        /* flex-direction: column;
        flex-wrap: wrap;

        align-items: flex-start;
        align-content: flex-start;
        justify-content: center;
         */
        font-size: 20px; 
    }

    div.label {
        margin: 0.5em;
        font-weight: bold;
    }

    div.value {
        margin: 0.5em;
    }

    div.submit {
        grid-column: 1 / span 2;
        text-align: center;
    }

    main {
        margin-top: var(--top-header-height);
        display: flex;
        flex-direction: row;
        justify-content: center;
    }

    main form {
        height: auto;
        box-shadow: 3px 3px 5px #1b2d3d;
        background-color: #2e79bf;
        color: black;

        border-radius: 15px;
    }
</style>