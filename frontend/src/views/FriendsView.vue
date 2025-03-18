<template>
  <main>
    <div v-if="user">
      <div class="content-container grid-form">
        <div class="form-label">Name:</div>
        <div class="form-value">{{ user.name }}</div>
        <div class="form-label">Email:</div>
        <div class="form-value">{{ user.email }}</div>
        <div class="form-label">Nickname:</div>
        <div class="form-value">{{ user.nickname }}</div>
        <div class="clickable form-label form-span2" @click="switchToEdit">Edit</div>
      </div>
      <div class="content-container">
        <h2>Invitations Received</h2>
        <ul>
          <li v-for="invitation in user.invites_received">
            {{ invitation }}
          </li>
        </ul>
      </div>

      <div class="content-container">
        <h2>Invitations Sent</h2>
        <ul>
          <li v-for="is in user.invites_sent">
            {{ is }}
          </li>
        </ul>
      </div>

      <div class="content-container">
        Send invite to: <input type="text" v-model="invitee" />
        <button @click="sendInvite">Send</button>
        <div v-if="error"> {{ error }}</div>
      </div>

    </div>
    <div v-else>
      <p>Loading...</p>
    </div>
</main>
</template>

<script setup>
import { useUserStore } from '@/stores/user.js'
import { storeToRefs } from 'pinia'
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const { user, error, exists } = storeToRefs(userStore)
const router = useRouter()
const invitee = ref('');
const invite_error = ref('');

onMounted(() => {
  console.log(`Fetching user from ${userStore}`)
  userStore.fetchUser().then(() => {
    if(exists.value ===false) {
      router.push( {name: 'userprofile'});
    }
  })
})

const sendInvite = () => {
  userStore.sendInvite(invitee.value).then(() => {
    userStore.fetchUser();
  })
}

const switchToEdit = () => {
  router.push({ name: 'userprofile' });
}

watch(exists, (newValue) => {
  if (!newValue) {
    router.push({ name: 'home' })
  }
})

watch(user, (newValue) => {
  console.log(`New user: ${user.value}`)
})

</script>

<style scoped>

</style>
