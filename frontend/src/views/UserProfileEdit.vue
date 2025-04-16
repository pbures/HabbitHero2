<template>
  <main>
    <form  class="content-container grid-form">
      <h1 class="form-span2">Edit Profile</h1>
      <div class="form-label">
        <label for="name">Name:</label>
      </div>
      <div class="form-value">
        <input type="text" id="name" v-model="user.name" required />
      </div>
      <div class="form-label">
        <label for="email">Email:</label>
      </div>
      <div class="form-value">
        <input type="email" id="email" v-model="user.email" required />
      </div>

      <div class="form-label">
        <label for="nickname">Nickname:</label>
      </div>
      <div class="form-value">
        <input type="text" id="nickname" v-model="user.nickname" required />
      </div>

      <div type="submit" class="form-label form-span2 clickable" id="submit" @click="updateProfile">Save</div>
    </form>
</main>
</template>

<script setup>
import { useUserStore } from '@/stores/user';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const user = ref({ ...userStore.user });
const router = useRouter();

const updateProfile = () => {
  console.log(`Saving user ${user.value}`);
  userStore.updateUser(user.value);
  router.push({ name: 'friends' });
};
</script>

<style scoped>


/* .user-profile-edit {
  max-width: 800px;
  margin: 0 auto;
  margin-top: 100px;
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.user-profile-edit h1 {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
}

.user-profile-edit form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.user-profile-edit form div {
  display: flex;
  flex-direction: column;
}

.user-profile-edit form label {
  font-weight: bold;
  margin-bottom: 5px;
  color: #555;
}

.user-profile-edit form input,
.user-profile-edit form textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-sizing: border-box;
  font-size: 14px;
}

.user-profile-edit form input:focus,
.user-profile-edit form textarea:focus {
  border-color: #007bff;
  outline: none;
}

.user-profile-edit form button {
  padding: 10px 15px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

.user-profile-edit form button:hover {
  background-color: #218838;
} */
</style>
