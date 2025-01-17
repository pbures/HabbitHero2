import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import * as auth0 from '@auth0/auth0-vue'

import { createTestingPinia } from '@pinia/testing';
import { setActivePinia, createPinia } from 'pinia';

import HomeView from '@/views/HomeView.vue';

vi.mock('@auth0/auth0-vue')


describe('HelloWorld.vue', () => {
  it('renders the correct message', () => {
    
    const pinia = createTestingPinia({
      stubActions: false,
      initialState: {
        myStore: { message: 'Mocked message!' },
      },
    });

    const mockFetchHabbits = vi.fn(() =>
      Promise.resolve([{ id: 1, name: 'Exercise' }, { id: 2, name: 'Read' }])
    );

    pinia.fetchHabbits = mockFetchHabbits

    auth0.useAuth0 = vi.fn().mockReturnValue({
      isAuthenticated: vi.fn().mockReturnValue(true),
      loginWithRedirect: vi.fn(),
    });

    const wrapper = mount(HomeView, {
      global: {
        plugins: [pinia],
      },
    });

    expect(wrapper.text()).toContain('Habbits number: 0');
  });

  // it('updates the message when the button is clicked', async () => {
  //   const wrapper = mount(HomeView);
  //   await wrapper.find('button').trigger('click');
  //   expect(wrapper.text()).toContain('You clicked the button!');
  // });
});