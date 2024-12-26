// src/stores/user.js
import { defineStore } from 'pinia'
import axios from 'axios'

const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true'

export const useUserStore = defineStore('user', {
  state: () => ({
    name: useMockData ? 'John Doe' : '', // Mock data
    email: useMockData ? 'john.doe@example.com' : '', // Mock data
  }),
  actions: {
    setName(name) {
      this.name = name
    },
    setEmail(email) {
      this.email = email
    },
    async fetchUserData() {
      if (useMockData) {
        console.log('Using mock data')
        return
      }

      try {
        const response = await axios.get('https://api.example.com/user')
        this.name = response.data.name
        this.email = response.data.email
      } catch (error) {
        console.error('Failed to fetch user data:', error)
      }
    },
  },
})