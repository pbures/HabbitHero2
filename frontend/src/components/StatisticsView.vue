<script setup>
import { Task } from '@/model/task';
import { ref, defineProps, defineEmits } from 'vue';

// import { Bar } from 'vue-chartjs'
// import exp from 'constants';

const props = defineProps(['habbit']);
const habbit = ref(props.habbit);

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'




// ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

//  export{
//   name: 'Graph',
//   components: {
//     Bar
//   },
//   data() {
//     return {
//       data: {
//         labels: ['Progress', 'Target'],
//         datasets: [{ data: [habbit.total_event_count, habbit.target] }]
//       },
//       options: {
//         responsive: true
//       }
//     }
//   }
// }


</script>

<template>
    <div class="habbit-statistics">
        <h1>Habbit Statistics</h1>
        <div id="close-btn-container">
            <button id="close-btn" @click="$emit('close-statistics')" >&#128473;</button>
        </div>
        <h2>ID: {{ habbit._id }}</h2>
        <h2>Title: {{ habbit.title }}</h2>
          <canvas id="myChart"></canvas>
    </div>
</template>

<style scoped>
h1 {
    font-size: 2em;
    color: #1b2d3d;
    text-align: center;
}
h2 {
    font-size: 1.5em;
    color: #1b2d3d;
    text-align: center;
}
.habbit-statistics {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin: 1em;
    padding: 1em;
    border: 1px solid white;
    box-shadow: 3px 3px 5px #1b2d3d;
    background: inherit;
    backdrop-filter: blur(10px);
    color: black;
}

#close-btn {
    font-size: 1.5em;
    color: #1b2d3d;
    background: inherit;
    border: none;
    cursor: pointer;
    position: absolute;
    right: 0;
    top: 0;
    padding: 0.5em;
}

#close-btn-container {
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
}
</style>