import * as auth0 from '@auth0/auth0-vue';
import { mount } from '@vue/test-utils';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { createTestingPinia } from '@pinia/testing';
import { useRouter } from 'vue-router';

import User from '@/model/user.mjs';
import FriendsView from '@/views/FriendsView.vue';

import { useUserStore } from '@/stores/user';
import { nextTick } from "process";

vi.mock('@auth0/auth0-vue')
vi.mock('vue-router');

let testingPinia;
let userStore;
let spies = {};

describe('FriendsView.vue', () => {
  beforeAll(() => {

    testingPinia = createTestingPinia({
      stubActions: false,
      initialState: {
        user: new User(),
        nicknames: [],
        loading: false,
        error: null,
        exists: undefined,
      },
    });

    userStore = useUserStore(testingPinia);
    spies.fetchUserSpy = vi.spyOn(userStore, 'fetchUser').mockImplementation(function() {
      console.log('mockFetchUser called via a spy');

      this.user = new User({
        _id: 1,
        schema_version: '1.0',
        user_id: 'example_user_id',
        name: 'John Doe',
        nickname: 'Johnny',
        email: 'john.doe@example.com',
        invites_sent: ['user-s-1', 'user-s-2'],
        invites_received: ['user-r-1', 'user-r-2'],
        friends: ['user-f-1', 'user-f-2'],
      });

      return Promise.resolve();
    });

    spies.userIdtoNicknameSpy = vi.spyOn(userStore, 'userIdtoNickname').mockImplementation(
      function(user_id) {
        let nicknames = [
          {user_id: 'user-s-1', nickname: 'N-user-s-1'},
          {user_id: 'user-s-2', nickname: 'N-user-s-2'},
          {user_id: 'user-r-1', nickname: 'N-user-r-1'},
          {user_id: 'user-r-2', nickname: 'N-user-r-2'},
          {user_id: 'user-f-1', nickname: 'N-user-f-1'},
          {user_id: 'user-f-2', nickname: 'N-user-f-2'},
        ]
        let n = nicknames.find( (element) => element.user_id === user_id);
        return n ? n.nickname : 'Johnny'
      }
    );

    spies.acceptInviteSpy = vi.spyOn(userStore, 'acceptInvite').mockImplementation(
      function(user_id) {
        console.log(`mockAcceptInvite called via a spy with ${user_id}`);
        return Promise.resolve();
      }
    );

    // eslint-disable-next-line no-import-assign
    auth0.useAuth0 = vi.fn().mockReturnValue({
      isAuthenticated: vi.fn().mockReturnValue(true),
      loginWithRedirect: vi.fn(),
      getAccessTokenSilently: vi.fn().mockResolvedValue('mocked token'),
    });
  });

  it('redirects user to userprofile after clicking edit', async () => {

    const mockRouterPush = vi.fn();
    useRouter.mockReturnValue({ push: mockRouterPush });

    const wrapper = mount(FriendsView, {
      global: {
        plugins: [testingPinia],
      }
    });

    wrapper.find('#edit-button').trigger('click');
    expect(mockRouterPush).toHaveBeenCalledWith({name: 'userprofile'});

  });

  it('renders the correct user information', async () => {
    const wrapper = mount(FriendsView, {
      global: {
        plugins: [testingPinia],
      },
    });

    let formValues = wrapper.findAll('.form-value');
    expect(formValues.length).toBe(3);

    nextTick( () => {
      expect(formValues[0].text()).toBe('John Doe');
      expect(formValues[1].text()).toBe('john.doe@example.com');
      expect(formValues[2].text()).toBe('Johnny');
    });

  });

  it('renders the correct user invitations received', async () => {
    const wrapper = mount(FriendsView, {
      global: {
        plugins: [testingPinia],
      },
    });

    let invitationReceived = wrapper.findAll('#invitations-received li');
    expect(invitationReceived.length).toBe(2);
    nextTick( () => {
      expect(invitationReceived[0].text()).toBe('N-user-r-1');
      expect(invitationReceived[1].text()).toBe('N-user-r-2');
    });
  });

  it('renders the correct user invitations sent', async () => {
    const wrapper = mount(FriendsView, {
      global: {
        plugins: [testingPinia],
      },
    });

    let invitationsSent = wrapper.findAll('#invitations-sent li');
    expect(invitationsSent.length).toBe(2);
    nextTick( () => {
      expect(invitationsSent[0].text()).toBe('N-user-s-1');
      expect(invitationsSent[1].text()).toBe('N-user-s-2');
    });
  });

  it('calls accept invite when clicked on accepting invite', async () => {
    const wrapper = mount(FriendsView, {
      global: {
        plugins: [testingPinia],
      },
    });

    nextTick( () => {
      let invitationCheckbox = wrapper.findAll('#invitations-received li .switch input');
      expect(invitationCheckbox.length).toBe(2);

      invitationCheckbox[0].setChecked(true);
      expect(spies.acceptInviteSpy).toHaveBeenCalledWith('N-user-r-1');
      invitationCheckbox[1].setChecked(true);
      expect(spies.acceptInviteSpy).toHaveBeenCalledWith('N-user-r-2');
    });
  });
});
