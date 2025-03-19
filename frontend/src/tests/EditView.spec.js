import { mount } from "@vue/test-utils";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { useHabbitStore } from '@/stores/task';
import EditView from "@/views/EditView.vue";
import { createTestingPinia } from '@pinia/testing';
import { nextTick } from "process";

let testingPinia;
let habbitStore;
let oneHabbit;

const spies = {};

describe("EditView.vue", () => {
  beforeAll(() => {

    // Setup the pinia store mock with it's actions, create spies on them
    testingPinia = createTestingPinia({
      stubActions: false,
      initialState: {
        habbits: [],
      },
    });

    habbitStore = useHabbitStore(testingPinia);

    spies.fetchHabbitsDataSpy = vi.spyOn(habbitStore, 'fetchHabbitsData').mockImplementation(() => {
       return Promise.resolve();
    });

    spies.getHabbitByIdSpy = vi.spyOn(habbitStore, 'getHabbitById').mockImplementation(() => {
      return oneHabbit;
    });

    spies.addNewHabbitSpy = vi.spyOn(habbitStore, 'addNewHabbit').mockImplementation(() => {
      return Promise.resolve();
    });

    //Mock the auth0 methods so the authentication is passed.
    vi.mock('@auth0/auth0-vue', () => ({
      useAuth0: () => ({
        isAuthenticated: true,
        loginWithRedirect: () => vi.fn(),
        getAccessTokenSilently: () => 'mocked token',
      }),
    }));

    //Mock the vue-router methods used in the components.
    vi.mock('vue-router', () => ({
      useRoute: vi.fn().mockReturnValue({ query: { taskId: 1 }}),
      useRouter: vi.fn().mockReturnValue({ push: vi.fn()}),
    }));


    oneHabbit = {
      _id: 1,
      type: 'goal',
      title: "Habbit Title",
      target: 5,
      total_event_count: 1,
      events: [{ num_of_events: 1, date: "2021-10-10" }],
    };


  });

  it('Has a: type,title,targer,total_event_count,events',async () => {
    const wrapper = mount(EditView, {
      global: {
        plugins: [testingPinia],
      },
    });

    await nextTick( () => {
      expect(wrapper.find('#taskType').element.value).toContain('goal');
      expect(wrapper.find('#taskName').element.value).toContain('Habbit Title');
      expect(wrapper.find('#taskRepetitions').element.value).toContain('5');
    });
  })

  it.skip('displays the title', async () => {
    const wrapper = mount(EditView, {
      global: {
        plugins: [testingPinia],
      },
    });

    expect(wrapper.find(".label").text()).toContain('Task Title');
    expect(spies.fetchHabbitsDataSpy).toHaveBeenCalled();
    expect(spies.getHabbitByIdSpy).toReturnWith(oneHabbit);
  });

  it('submits the form', async () => {
    const wrapper = mount(EditView, {
      global: {
        plugins: [testingPinia],
      },
    });

    expect(wrapper.find("#saveTaskDataAction").exists()).toBe(true);
    expect(wrapper.find("#saveTaskDataAction").trigger("click"));
    await wrapper.find("#saveTaskDataAction");

    expect(spies.addNewHabbitSpy).toHaveBeenCalled();
  })

  afterAll(() => {
    vi.resetAllMocks();
  });
});
