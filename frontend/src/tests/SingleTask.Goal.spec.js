import SingleTask from "@/components/SingleTask.vue";
import { createTestingPinia } from '@pinia/testing';
import { mount } from "@vue/test-utils";
import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock('@auth0/auth0-vue')

import User from "@/model/user.mjs";
import { useHabbitStore } from '@/stores/task';
import { useUserStore } from '@/stores/user';

let testingPinia;
let habbitStore, userStore;
let oneHabbit;

describe('SingleTask - Goal', () => {
  beforeAll(() => {
    testingPinia = createTestingPinia({ stubActions: false });
    habbitStore = useHabbitStore(testingPinia);
    userStore = useUserStore(testingPinia);

    oneHabbit = {
      _id: 1,
      type: 'goal',
      title: 'Goal Task',
      target: 5,
      total_event_count: 2,
      events: [{ num_of_events: 1, date: '2021-10-10' }, { num_of_events: 1, date: '2021-11-01' }],
      days_in: [1, 2],
      observer_ids: []
    }

    habbitStore.habbits = [oneHabbit];

    userStore.user = User.createExampleInstance();
    userStore.user._id = 1;
    userStore.user.friends = [1, 2, 3];

    // stub methods we care about
    habbitStore.removeHabbitsFromEvent = vi.fn().mockResolvedValue(true);
    habbitStore.addHabbitsEvent = vi.fn().mockResolvedValue(true);
  });

  it('calls addHabbitsEvent with a Date for goals when confirm (check) pressed', async () => {
    const wrapper = mount(SingleTask, {
      global: { plugins: [testingPinia] },
      props: { habbit: oneHabbit }
    });

    const confirmBtn = wrapper.find('#add-progress');
    expect(confirmBtn.exists()).toBe(true)
    await confirmBtn.trigger('click');

    expect(habbitStore.addHabbitsEvent).toHaveBeenCalledTimes(1);
    expect(habbitStore.addHabbitsEvent).toHaveBeenCalledWith(1, expect.any(Date));
  });

  it('calls removeHabbitsFromEvent with null for goals when X pressed', async () => {
    const wrapper = mount(SingleTask, {
      global: { plugins: [testingPinia] },
      props: { habbit: oneHabbit }
    });

    // The remove (X) button now has id `remove-progress`.
    const removeBtn = wrapper.find('#remove-progress');
    expect(removeBtn.exists()).toBe(true);
    await removeBtn.trigger('click');

    expect(habbitStore.removeHabbitsFromEvent).toHaveBeenCalledTimes(1);
    expect(habbitStore.removeHabbitsFromEvent).toHaveBeenCalledWith(1, null);
  });
});
