// src/stores/user.js
import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuth0 } from '@auth0/auth0-vue'
import habbitsMockData from '../model/habbit.js'

function getMockData(){
  return [ habbitsMockData,  habbitsMockData, habbitsMockData, habbitsMockData ]
}

const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true'

export const useHabbitStore = defineStore('habbit', {
  state: () => ({
    habbits: [],
  }),
  
  actions: {
    getHabbits() {
        return this.habbits;
    },

    addNewHabbit(habbit) {
      this.habbits.push(habbit);
    },

    async fetchHabbitsData() {
      if (useMockData) {
        console.log('Using mock data to get habbits')
        let data =  getMockData()
        let model = this;
        console.log(model.habbits);

        return new Promise( (resolve) => {
            setTimeout(() => {
                model.habbits = data;
                resolve(data);
            }, 1000);
        });

      }

      const { getAccessTokenSilently } = useAuth0()

      try {
        const token = await getAccessTokenSilently()
        const response = await axios.get('https://api.example.com/habbits', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        this.habbits = response.data.habbits

      } catch (error) {
        console.error('Failed to fetch habbit data:', error)
      }
    },
  },
})
