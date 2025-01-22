import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeAll, vi } from 'vitest';
import * as auth0 from '@auth0/auth0-vue'

import { createTestingPinia } from '@pinia/testing';

import TasksView from '@/views/TasksView.vue';
import { Task } from '@/model/task';

import { useHabbitStore } from '@/stores/task';

vi.mock('@auth0/auth0-vue')

let testingPinia;
let habbitStore;
let spies = {};

describe('TasksView.vue', () => {
  beforeAll(() => {

    testingPinia = createTestingPinia({
      stubActions: false,
      initialState: {
        habbits: [],
      },
    });

    habbitStore = useHabbitStore(testingPinia);
    spies.fetchHabbitsDataSpy = vi.spyOn(habbitStore, 'fetchHabbitsData').mockImplementation(function() {
      console.log('mockFetchHabbits called via a spy');

      this.habbits = [
        new Task(),
        new Task(),
        new Task(),
      ];

      return Promise.resolve(true);
    });

    spies.addHabbitsEventSpy = vi.spyOn(habbitStore, 'addHabbitsEvent').mockReturnValue(true);

    // eslint-disable-next-line no-import-assign
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

    expect(wrapper.findAll('.task-container').length).toBe(3);
  });

  it('adds an event to the task', () => {
    const wrapper = mount(TasksView, {
      global: {
        plugins: [testingPinia],
      },
    });

    const addProgress = wrapper.find('#add-progress')
    expect(addProgress.exists()).toBe(true);
    addProgress.trigger('click');

    expect(spies.addHabbitsEventSpy).toBeCalled();
  });

});
