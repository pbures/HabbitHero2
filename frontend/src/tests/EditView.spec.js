import { expect, beforeAll } from "vitest";
import { mount } from "@vue/test-utils";
import EditView from "@/views/EditView.vue";
import { describe, it } from "node:test";
import { useHabbitStore } from '@/stores/task';
import { createTestingPinia } from '@pinia/testing';

vi.mock('@auth0/auth0-vue')

import { useHabbitStore } from '@/stores/task';
import { describe } from "node:test";

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

    auth0.useAuth0 = vi.fn().mockReturnValue({
      isAuthenticated: vi.fn().mockReturnValue(true),
      loginWithRedirect: vi.fn(),
      getAccessTokenSilently: vi.fn().mockResolvedValue('mocked token'),
    });

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
  });

  it('displays the title', async () => {
    const wrapper = mount(EditView, {
      global: {
        plugins: [testingPinia],
      },
      props: {
        habbit: oneHabbit,
      }
    });
    expect(wrapper.find(".title").text()).toContain("Habbit Title");
  });

  it('submits the form', async () => {
      const wrapper = mount(EditView, {
      global: {
        plugins: [testingPinia],
      },
      props: {
        habbit: oneHabbit,
      }
    });

    const confirmEventSpy = vi.spyOn(wrapper.vm, 'saveTaskData');
    await wrapper.find(".submit").trigger("click");
    expect(confirmEventSpy).toHaveBeenCalled();
  })
});
