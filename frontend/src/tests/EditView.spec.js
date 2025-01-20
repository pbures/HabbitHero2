import { describe, it, vi, expect, beforeAll } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import EditView from "@/views/EditView.vue";
import { createTestingPinia } from '@pinia/testing';
import { useHabbitStore } from '@/stores/task';
import { nextTick } from "process";

let testingPinia;
let habbitStore;
let oneHabbit;

describe("EditView.vue", () => {
  beforeAll(() => {
    testingPinia = createTestingPinia({
      stubActions: false,
      initialState: {
        habbits: [],
      },
    });

    vi.mock('@auth0/auth0-vue', () => ({
      useAuth0: () => ({
        isAuthenticated: true,
        loginWithRedirect: () => vi.fn(),
        getAccessTokenSilently: () => vi.fn().mockReturnValue('mocked token'),
      }),
    }));

    //Mock the vue-router methods used in the components.
    vi.mock('vue-router', () => ({
      useRoute: vi.fn().mockReturnValue({ query: { taskId: 1 }}), 
      useRouter: vi.fn().mockReturnValue({ push: vi.fn()}), 
    }));

    habbitStore = useHabbitStore(testingPinia);

    oneHabbit = {
      _id: 1,
      type: 'goal',
      title: "Habbit Title",
      target: 5,
      total_event_count: 1,
      events: [{ num_of_events: 1, date: "2021-10-10" }],
    };

    habbitStore.habbits = [oneHabbit];
    habbitStore.fetchHabbitsData = function() {
      return Promise.resolve();
    }
    habbitStore.getHabbitById = function() {
      console.log("Ted mu lzu!!")
      return oneHabbit;                 
    }
                
  });

it('Has a: type,title,targer,total_event_count,events',async () => {
  const wrapper = mount(EditView, {
    global: {
      plugins: [testingPinia],
    },
    props: {
      habbit: oneHabbit,
    }
  });

  // await flushPromises();
  await nextTick( () => {
    expect(wrapper.find('#taskType').element.value).toContain('goal');
    expect(wrapper.find('#taskName').element.value).toContain('Habbit Title');
    expect(wrapper.find('#taskRepetitions').element.value).toContain('5');
  });

 
  
})

  it('displays the title', async () => {
    const wrapper = mount(EditView, {
      global: {
        plugins: [testingPinia],
      },
    });

    expect(wrapper.find(".label").text()).toContain('Task Title');
  });

  it('submits the form', async () => {
    const wrapper = mount(EditView, {
      global: {
        plugins: [testingPinia],
      },
    });

    const confirmEventSpy = vi.spyOn(wrapper.vm, 'saveTaskData');
    expect(wrapper.find("#saveTaskDataAction").exists()).toBe(true);

    await wrapper.find("#saveTaskDataAction");
    // expect(confirmEventSpy).toHaveBeenCalled();
  })
});
