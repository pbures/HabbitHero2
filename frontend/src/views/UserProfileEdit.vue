<template>
  <div class="user-profile-edit">
    <h1>Edit Profile</h1>
    <form @submit="updateProfile">
      <div>
        <label for="name">Name:</label>
        <input type="text" id="name" v-model="user.name" required />
      </div>
      <div>
        <label for="email">Email:</label>
        <input type="email" id="email" v-model="user.email" required />
      </div>

      <div>
        <label for="nickname">Nickname:</label>
        <input type="text" id="nickname" v-model="user.nickname" required />
      </div>

      <div>
        <label for="bio">Bio:</label>
        <textarea id="bio" v-model="user.bio"></textarea>
      </div>
      <button type="submit">Save</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
const user = ref({ ...userStore.user });

const updateProfile = () => {
  userStore.updateUser(user.value);
};
</script>

<style scoped>
.user-profile-edit {
  max-width: 600px;
  margin: 0 auto;
  margin-top: 150px;
}

.user-profile-edit form {
  display: flex;
  flex-direction: column;
}

.user-profile-edit form div {
  margin-bottom: 1em;
}

.user-profile-edit form label {
  margin-bottom: 0.5em;
}

.user-profile-edit form input,
.user-profile-edit form textarea {
  width: 100%;
  padding: 0.5em;
  box-sizing: border-box;
}

.user-profile-edit form button {
  padding: 0.5em 1em;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}

.user-profile-edit form button:hover {
  background-color: #0056b3;
}
</style>
