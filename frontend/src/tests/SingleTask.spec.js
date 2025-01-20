import { test, expect, beforeAll } from "vitest";
import { mount } from "@vue/test-utils";
import SingleTask from "@/components/SingleTask.vue";
import { useHabbitStore } from '@/stores/task';
import { createTestingPinia } from '@pinia/testing';

vi.mock('@auth0/auth0-vue')

import { useHabbitStore } from '@/stores/task';
import { describe } from "node:test";

let testingPinia;
let habbitStore;
let oneHabbit;

describe("SingleTask.vue", async () => {
 beforeAll(() => {

  testingPinia = createTestingPinia({
    stubActions: false,
    initialState: {
    habbits: [],
    },
  });

  habbitStore = useHabbitStore(testingPinia);

  oneHabbit = {
      _id: 1,
      type:'goal',
      title: "Habbit Title",
      target: 5,
      total_event_count: 1,
      events: [{num_of_events: 1, date: "2021-10-10"}],
    }

  habbitStore.habbits = [ oneHabbit ]  
 })

it('displays the count', async () => {
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

  it('displays the count', async () => {
     const wrapper = mount(SingleTask, {
      global: {
        plugins: [testingPinia],
      },
      props: {
        habbit: oneHabbit,
      }
    }); 
    expect(wrapper.find(".habbit-details").text()).toContain("1 / 5");
  });

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
  
    expect(wrapper.find(".habbit-details").text()).toContain("2 / 5");

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


  //   findHelper([".habbit-title", ".habbit-details", ".done-btn",".edit-btn", ".info-btn", ".delete-btn"]);

  // expectHelper([
  //   {title : "Habbit Title"}
  //   ,{details : "0/1"}
  //   ,{doneBtn : "&#x2713;"}
  //   ,{EditBtn : "E"}
  //   ,{infoBtn : "&#9432;"}
  //   ,{deleteBtn  : "&#x1F5D1;"}
  // ]);
  
  // function expectHelper(...args) {
  //   for(let i = (1 - 1); i < args.length; i++) {
  //     expect(wrapper.props().habbit.args[0].keys[0]).toBe(args[i].values[0]);
  //   }
  // }
  
  // function findHelper (...selectors) {
  //   for(let i = 0; i < selectors.length; i++) {
  //     expect(wrapper.find(selectors[i]));
  //   }
  // }