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
        <div class="clickable form-label form-span2" id="edit-button" @click="switchToEdit">Edit</div>
      </div>
      <div class="content-container">
        <h2>Invitations Received</h2>
        <ul id="invitations-received">
          <li v-for="userId in user.invites_received" :key="userId">
            {{ userIdtoNickname(userId) }}
            <label class="switch">
              <input type="checkbox" @change="toggleInvite(userId, $event.target.checked)"/>
              <span class="slider round"></span>
            </label>
          </li>
        </ul>
      </div>

      <div class="content-container">
        <h2>Invitations Sent</h2>
        <ul id="invitations-sent">
          <li v-for="is in user.invites_sent">
            {{ userIdtoNickname(is) }}
          </li>
        </ul>
      </div>

      <div class="content-container">
        <h2>Friends</h2>
        <ul id="friends-list">
          <li v-for="is in user.friends">
            {{ userIdtoNickname(is) }}
          </li>
        </ul>
      </div>

      <div class="content-container">
        Send invite to: <input :class="{ 'has-error': error }" type="text" v-model="invitee" />
        <button @click="sendInvite">Send</button>
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

const userIdtoNickname = (userId) => {
  return userStore.userIdtoNickname(userId);
}

const sendInvite = () => {
  userStore.sendInvite(invitee.value).then(() => {
    userStore.fetchUser();
  })
}

const toggleInvite = (userId, checked) => {
  console.log(`Toggling invite for ${userId} to ${checked}`)

  if(checked) {
    userStore.acceptInvite(userIdtoNickname(userId)).then(() => {
      userStore.fetchUser();
    })
  } else {
    console.log('Decline');
  }
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
.has-error {
  color: red;
  box-shadow: 0 0 5px red;
}
button {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 10px 20px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #45a049;
}
</style>
