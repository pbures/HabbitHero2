<template>
  <div class="days-in-week-selector">
    <div v-for="(d, i) in possibleDays" :key="d" class="day" @click="updateSelectedDay(i)" :class="dayClass(i)"> {{ d }} </div>
  </div>
</template>

<script setup>
  import { toRefs, ref } from 'vue'

  const props = defineProps(['selectedDays']);
  const { selectedDays } = toRefs(props);

  const possibleDays = ref(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);

  function dayClass(di) {
    return (selectedDays.value.indexOf(di) !== -1) ? "selected" : "unselected";
  }

  const emit = defineEmits(['update-selected-days']);

  function updateSelectedDay(di) {
    if (!selectedDays.value || !selectedDays?.value) { return };

    let dayIndex = selectedDays.value.indexOf(di);

    if ( dayIndex === -1 ){
      selectedDays.value.push(di)
    } else {
      selectedDays.value.splice(dayIndex, 1)
    }

    updateSelection(selectedDays);
  }

  function updateSelection(days) {
    emit('update-selected-days', days);
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

