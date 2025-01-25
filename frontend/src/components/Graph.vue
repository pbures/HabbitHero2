<template>
  <DoughnutChart :chartData="chartData" />
</template>

<script>
import { ref, defineComponent } from 'vue';
import { DoughnutChart } from 'vue-chart-3';
import { Chart, registerables } from 'chart.js';

// Register chart.js components
Chart.register(...registerables);

export default defineComponent({
  name: 'GoalChart',
  components: { DoughnutChart },
  props: {
    habbit: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const chartData = ref({
      labels: ['Your Progress', 'Remaining Goal'],
      datasets: [
        {
          data: [props.habbit.total_event_count, props.habbit.target],
          backgroundColor: ['#FF0000', '#0000FF'],
        },
      ],
    });

    console.log('Habbit:', props.habbit);

    return { chartData };
  },
});
</script>
