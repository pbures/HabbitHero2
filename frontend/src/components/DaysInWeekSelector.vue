
<template>
  <div class="days-in-week-selector" @click="updateSelection([1,2.3])">
    <div v-for="(d, i) in possibleDays" class="day" @click="updateSelectedDay(i)" :class="dayClass(i)"> {{ d }} </div>
  </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue';
const selectedDays = ref([]);

const possibleDays = ref(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
const props = defineProps(['selectedDays']);


if (props.selectedDays) {
  selectedDays.value = props.selectedDays
}

function dayClass(di) {
  return (selectedDays.value.indexOf(di) !== -1) ? "selected" : "unselected";
}

const emit = defineEmits(['update-selected-days']);

function updateSelectedDay(di) {
  let dayIndex = selectedDays.value.indexOf(di);

  if ( dayIndex === -1 ){
    selectedDays.value.push(di)
    console.log(`Adding day: ${di}`)
  } else {
    selectedDays.value.splice(dayIndex, 1)
    console.log(`Removing day: ${di}`)
  }

  updateSelection(selectedDays);
}

function updateSelection(days) {
  console.log('Selected days:', days.value);
  emit('update-selected-days', selectedDays);
}
</script>

<style scoped>
  .days-in-week-selector {
    display: flex;
    flex-direction: row;
    justify-content: center;
  }

  .day {
    border: 1px solid black;
    padding: 2px;
    margin: 2px;
  }

  .selected {
    background-color:rgba(0,160,0, 0.3);
  }
</style>

