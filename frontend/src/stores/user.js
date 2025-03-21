// src/stores/user.js
/* This defines a pinia store for Vue3 js that is a data store over a REST api with the following calls:

GET /user which returns the User clas from ../model/user.js
PUT /user
PUT /invite?invite=theNickname
PUT /accept
PUT /invite?nickname=theNickname
*/

import { useAuth0 } from '@auth0/auth0-vue'
import axios from 'axios'
import { defineStore } from 'pinia'
import User from '../model/user.js'

const backendUrl = import.meta.env.VITE_H2_BACKEND

export const useUserStore = defineStore('user', {
  state: () => ({
    auth0: useAuth0(),
    user: new User(),
    loading: false,
    error: null,
    exists: undefined,
  }),

  actions: {
    async fetchUser() {
      this.loading = true;
      try {
        const token = await this.auth0.getAccessTokenSilently();
        const response = await axios.get(`${backendUrl}/user`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        this.exists = true;
        this.user = new User({
            user_id: response.data.user_id,
            name: response.data.name,
            email: response.data.email,
            nickname: response.data.nickname,
            invites_sent: response.data.invites_sent,
            invites_received: response.data.invites_received,
        })
      } catch (error) {
        this.error = error;
        this.exists = false;
      } finally {
        this.loading = false;
      }
    },
    async updateUser(userData) {
      this.loading = true;

      try {
        const token = await this.auth0.getAccessTokenSilently();
        await axios.put(`${backendUrl}/user`, userData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        this.user = new User(userData);
      } catch (error) {
        this.error = error;
      } finally {
        this.loading = false;
      }
    },
    async sendInvite(nickname) {
      this.loading = true;
      try {
        const token = await this.auth0.getAccessTokenSilently();
        await axios.put(`${backendUrl}/invite?nickname=${nickname}`, null, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        this.error = null;
      } catch (error) {
        this.error = error;
      } finally {
        this.loading = false;
      }
    },
    async acceptInvite() {
      this.loading = true;
      try {
        const token = await this.auth0.getAccessTokenSilently();
        await axios.put(`${backendUrl}/accept`, null, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      } catch (error) {
        this.error = error;
      } finally {
        this.loading = false;
      }
    },
  },
});
