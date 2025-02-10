<template>
  <div class="days-in-month-selector">
    <div v-for="(d, i) in possibleDays" :key="d" class="day" @click="updateSelectedDay(i)" :class="dayClass(i)"> {{ d }} </div>
  </div>
</template>

<script setup>
  import { onMounted, toRefs, ref } from 'vue'
  const possibleDays = ref([]);

  const props = defineProps(['selectedDays']);
  const { selectedDays } = toRefs(props);

  onMounted( () => {
    for(let i=1; i <= 31; i++) { possibleDays.value.push(i) }
  });

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
    emit('update-selected-days', days);
  }

</script>

<style scoped>
  .days-in-month-selector {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
    flex-direction: row;
    justify-content: center;
    margin: 5px;
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
