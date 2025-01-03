// src/stores/user.js
import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuth0 } from '@auth0/auth0-vue'
import userMockData from '../model/user.js'

function getMockData(){
  return userMockData
}

const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true'

export const useUserStore = defineStore('user', {
  state: () => ({
    name: '',
    email: ''
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
        let data =  getMockData()
        let model = this

        return new Promise( (resolve) => {
            setTimeout(() => {
                model.name = data.name
                model.email = data.email
                resolve(data);
            }, 2000);
        });

      }

      const { getAccessTokenSilently } = useAuth0()

      try {
        const token = await getAccessTokenSilently()
        const response = await axios.get('http://localhost:3000/user', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        
        this.name = response.data.name
        this.email = response.data.email
      } catch (error) {
        console.error('Failed to fetch user data:', error)
      }
    },
  },
})
