import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeAll } from 'vitest';
import * as auth0 from '@auth0/auth0-vue'

import { createTestingPinia } from '@pinia/testing';

import TasksView from '@/views/TasksView.vue';
import { Task } from '@/model/task';

import { useHabbitStore } from '@/stores/task';

vi.mock('@auth0/auth0-vue')

const testingPinia = createTestingPinia({
  stubActions: false,
  initialState: {
    habbits: [],
  },
});

describe('TasksView.vue', () => {
  beforeAll(() => {
    const habbitStore = useHabbitStore(testingPinia);
    vi.spyOn(habbitStore, 'fetchHabbitsData').mockImplementation(function() {
      console.log('mockFetchHabbits called via a spy');
  
      this.habbits = [
        new Task(),
        new Task(),
      ];  

      return Promise.resolve(true);
    });

    auth0.useAuth0 = vi.fn().mockReturnValue({
      isAuthenticated: vi.fn().mockReturnValue(true),
      loginWithRedirect: vi.fn(),
      getAccessTokenSilently: vi.fn().mockResolvedValue('mocked token'),
    });
  });

  it('renders the correct message', () => {
    const wrapper = mount(TasksView, {
      global: {
        plugins: [testingPinia],
      },
    });

    expect(wrapper.findAll('.task-container').length).toBe(2);
  });

});