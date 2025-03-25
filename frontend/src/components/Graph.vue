<template>
  <DoughnutChart :chartData="chartData" />
</template>

<script>
import { defineComponent, ref } from 'vue';

import Chart from 'chart.js/auto';
import { DoughnutChart } from 'vue-chart-3';

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
