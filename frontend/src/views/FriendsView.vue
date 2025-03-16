<template>
  <div class="view-container">
    <div v-if="user">
      <div class="basic-details">
        <p><strong>Name:</strong> {{ user.name }}</p>
        <p><strong>Email:</strong> {{ user.email }}</p>
        <p><strong>Nickname:</strong> {{ user.nickname }}</p>
        <button @click="switchToEdit">edit</button>
      </div>
      <div class="invitations-received">
        <h2>Invitations Received</h2>
        <ul>
          <li v-for="invitation in user.invites_received">
            {{ invitation }}
          </li>
        </ul>
      </div>

      <div class="invitations-sent">
        <h2>Invitations Sent</h2>
        <ul>
          <li v-for="is in user.invites_sent">
            {{ is }}
          </li>
        </ul>
      </div>

      <div class="send-invitation">
        Send invite to: <input type="text" v-model="invitee" />
        <button @click="sendInvite">Send</button>
        <div v-if="error"> {{ error }}</div>
      </div>

    </div>
    <div v-else>
      <p>Loading...</p>
    </div>
  </div>
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
  .view-container {
      margin-top: var(--top-header-height);
      display: flex;
      justify-content: center;
      align-content:start;

      background: inherit;
      backdrop-filter: blur(10px);
      font-size: 20px;

      color: black;
  }
h1 {
  font-size: 2em;
  margin-bottom: 0.5em;
}

p {
  font-size: 1.2em;
  margin: 0.2em 0;
}

strong {
  color: black;
}

div {
  padding-top: 150px;
  padding: 1em;
  border: 1px solid #ddd;
  border-radius: 5px;
  /* background-color: #f9f9f9; */
}
</style>
