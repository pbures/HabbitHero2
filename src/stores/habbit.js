// src/stores/user.js
import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuth0 } from '@auth0/auth0-vue'
import habbitsMockData from '../model/habbit.js'

function getMockData() {
  const ret = []

  for (let i = 0; i < 10; i++) {
    let nh = Object.assign({}, habbitsMockData)
    nh._id = i
    if (nh._id % 3 !== 0) {
      nh.type = 'goal'
      nh.target = 1 + Math.floor(Math.random() * 99)
      nh.total_event_count = Math.floor(Math.random() * 50)
    } else {
      nh.type = 'habbit'
      nh.target = 0
      nh.total_event_count = Math.floor(Math.random() * nh.target)
    }

    ret.push(nh)
  }

  return ret;
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

    async addNewHabbit(habbit) {
      if (useMockData) {
        return new Promise((resolve) => {
          setTimeout(() => {
            this._addNewHabbitMock(habbit);
            resolve()
          }, 1000)
        })
      } else {
        //TODO: Add or update the habbit on the server and  re-fetch all users habbits.
      }
    },

    _addNewHabbitMock(habbit) {

      if (useMockData) {
        /* Update existing */
        if (habbit._id !== null) {
          for (let i = 0; i < this.habbits.length; i++) {
            if (this.habbits[i]._id === habbit._id) {
              this.habbits[i] = habbit;
              return
            }
          }
        }

        /* Create new ID and add to the array */
        let maxId = 0;
        this.habbits.forEach((e) => {
          if (e._id > maxId) {
            maxId = e._id;
          }
        })

        habbit._id = maxId + 1;
        this.habbits.push(habbit);
      }

    },

    addHabbitsEvent(habbitId) {
      let h
      for (let h1 of this.habbits) {
        if (h1._id === habbitId) {
          h = h1;
          break;
        }
      }

      // let h = this.habbits.findOne(h => h._id === habbitId)
      if (!h) {
        console.error('Habbit not found');
        return;
      }

      h.total_event_count++;

      h.events.push({
        num_of_events: 1,
        date: new Date().toISOString()
      });

      /* TODO: Save the data to the server and reload the habbit with it's ids*/
    },

    async deleteHabbit(habbitId) {
      const habbits = this.habbits.filter(h => h._id !== habbitId);
      this.habbits = habbits;
    },

    getHabbitById(habbitId) {
      const habbit = this.habbits.filter(h => h._id == habbitId)
      console.log(this.habbits)
      console.log('Habbit:', habbit);
      return habbit[0]
    },

    async fetchHabbitsData() {
      if (useMockData) {
        if (this.habbits.length > 0) {
          return;
        }
        console.log('Using mock data to get habbits')
        let data = getMockData()
        let model = this;
        console.log(model.habbits);

        return new Promise((resolve) => {
          setTimeout(() => {
            model.habbits = data;
            resolve(data);
          }, 500);
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
