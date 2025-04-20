import SingleTask from "@/components/SingleTask.vue";
import { createTestingPinia } from '@pinia/testing';
import { mount } from "@vue/test-utils";
import { beforeAll, expect, vi } from "vitest";

vi.mock('@auth0/auth0-vue')

import User from "@/model/user.mjs";

import { useHabbitStore } from '@/stores/task';
import { useUserStore } from '@/stores/user';
import { describe, it } from "vitest";

let testingPinia;
let habbitStore, userStore;
let oneHabbit;

describe("SingleTask.vue", async () => {
 beforeAll(() => {

  testingPinia = createTestingPinia({
    stubActions: true,
  });

  habbitStore = useHabbitStore(testingPinia);
  userStore = useUserStore(testingPinia);

  oneHabbit = {
      _id: 1,
      type:'goal',
      title: "Habbit Title",
      target: 5,
      total_event_count: 1,
      events: [{num_of_events: 1, date: "2021-10-10"}],
      days_in: [1, 2],
    }

  habbitStore.habbits = [ oneHabbit ]
  userStore.user = User.createExampleInstance();
  userStore.user._id = 1;
  userStore.user.friends = [1, 2, 3, 4];

  userStore.userIdtoNickname = vi.fn().mockImplementation((id) => {
    return `Friend-${id}`;
  });

  habbitStore.shareHabbit = vi.fn().mockImplementation((id, friendId) => {
    console.log("Mock share habbit called");
    return true;
  });

  habbitStore.addHabbitsEvent = vi.fn().mockImplementation((id, event) => {
    console.log("Mock add habbit event called");
    return true;
  });

 })

it('displays the habbit and shows friends list once clicked on friends icon', async () => {
  const wrapper = mount(SingleTask, {
   global: {
     plugins: [testingPinia],
   },
   props: {
     habbit: oneHabbit,
   }
 });
  expect(wrapper.find(".habbit").exists()).toBe(true);

  expect(wrapper.find("#invite").isVisible()).toBe(true);
  const toggleFriends = wrapper.find("#invite");

  expect(wrapper.find(".friends-list").exists()).toBe(false);
  await toggleFriends.trigger("click");
  expect(wrapper.find(".friends-list").exists()).toBe(true);
  expect(wrapper.find(".friends-list").isVisible()).toBe(true);

  const inviteFriends = wrapper.findAll(".friend div");
  expect(inviteFriends.length).toBe(4);

  expect(inviteFriends[0].text()).toContain("Friend-1");
  const inviteFriend = inviteFriends[0].find(".clickable")
  expect(inviteFriend.exists()).toBe(true);

  await inviteFriend.trigger("click");
  expect(habbitStore.shareHabbit).toHaveBeenCalled();
  expect(habbitStore.shareHabbit).toHaveBeenCalledWith(1, 1);
});

it('displays the habbit with title and details', async () => {
     const wrapper = mount(SingleTask, {
      global: {
        plugins: [testingPinia],
      },
      props: {
        habbit: oneHabbit,
      }
    });
    expect(wrapper.find(".habbit").exists()).toBe(true);
    expect(wrapper.find(".title").text()).toContain("Habbit Title");
    expect(wrapper.find(".habbit-details").exists()).toBe(true);
  });

  it('shows the habbit with the right dates selected', async () => {
    const wrapper = mount(SingleTask, {
      global: {
        plugins: [testingPinia],
      },
      props: {
        habbit: oneHabbit,
      }


  }

  it('updates the count', async () => {
     const wrapper = mount(SingleTask, {
      global: {
        plugins: [testingPinia],
      },
      props: {
        habbit: oneHabbit,
      }
    });
    const confirmEventSpy = vi.spyOn(wrapper.vm, 'confirmEvent');
    await wrapper.find("#add-progress").trigger("click");
    expect(confirmEventSpy).toHaveBeenCalled();
    expect(habbitStore.addHabbitsEvent).toHaveBeenCalled();
  });

  it('deletes the task', async () => {
     const wrapper = mount(SingleTask, {
      global: {
        plugins: [testingPinia],
      },
      props: {
        habbit: oneHabbit,
      }
    });
    const confirmEventSpy = vi.spyOn(wrapper.vm, 'deleteHabbit');
    await wrapper.find("#delete").trigger("click");
    expect(confirmEventSpy).toHaveBeenCalled();
  });

  it.todo('redirects to edit.vue');
});
