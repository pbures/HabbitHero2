// src/stores/user.js
import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuth0 } from '@auth0/auth0-vue'
import { Task } from '../model/task.js'
import { getDateStr } from '@/utils/findDates.js'



function getMockData() {
  const ret = []

  for (let i = 0; i < 15; i++) {
    let nh = new Task()
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
  console.log('Mock data:', ret)
  return ret;
}

const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true'
const backendUrl = import.meta.env.VITE_H2_BACKEND

console.log(`Backend URL: ${backendUrl}`)

export const useHabbitStore = defineStore('habbit', {
  state: () => ({
    auth0: useAuth0(),
    habbits: [],
  }),

  actions: {
    getHabbits() {
      return this.habbits;
    },

    async addNewHabbit(habbit) {
      try {
        if (useMockData) {
          return new Promise((resolve) => {
            setTimeout(() => {
              this._addNewHabbitMock(habbit);
              resolve()
            }, 1000)
          })

        } else {

          const token = await this.auth0.getAccessTokenSilently()
          await axios.put(`${backendUrl}/habbit`,
            habbit,
            {
              headers: {
                Authorization: `Bearer ${token}`
              },
            }
          )
        }
      } catch (error) {
        console.error('Failed to add new habbit:', error)
      };
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

    async removeHabbitsFromEvent(habbitId, dateToRemove) {
      console.log(`Removing events with date: ${dateToRemove} in event: ${habbitId}`);
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

      h.total_event_count = h.events.length;

      h.events = h.events.filter( (e) => {
        const d1 = getDateStr(new Date(e.date));
        const d2 = getDateStr(dateToRemove);

        const ret = ( d1 != d2 )
        return ret;
      });

      await this.addNewHabbit(h);
      await this.fetchHabbitsData();

    },

    async addHabbitsEvent(habbitId, theDate=null) {
      console.log('Adding event (date: ', theDate ,') to habbit:', habbitId);
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

      h.events.push({
        num_of_events: 1,
        date: theDate ? theDate.toISOString() : new Date().toISOString(),
      });

      h.total_event_count = h.events.length;

      await this.addNewHabbit(h);
      await this.fetchHabbitsData();
      console.log('Added event, and fetched habbits data:', this.habbits);
    },

    async deleteHabbit(habbitId) {
      const token = await this.auth0.getAccessTokenSilently()

      try {
        const habbits = this.habbits.filter(h => h._id !== habbitId);
        this.habbits = habbits;
        axios.delete(`${backendUrl}/habbit`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: {
            'habbitId': habbitId,
          }
        })
      } catch (error) {
        console.error('Failed to delete habbit:', error)
      };
    },

    getHabbitById(habbitId) {
      const habbit = this.habbits.filter(h => h._id == habbitId)
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

      try {
        const token = await this.auth0.getAccessTokenSilently()
        const response = await axios.get(`${backendUrl}/habbits`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        this.habbits = response.data
      } catch (error) {
        console.error('Failed to fetch habbit data:', error)
      }
    },
  },
})

