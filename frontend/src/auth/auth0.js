import { createAuth0 } from '@auth0/auth0-vue'

export default createAuth0({
  domain: 'dev-mqs0y7skubj0n8if.us.auth0.com',
  clientId: 'jkAOIaPX2wsUxe2CWgKu7Klhif7EP91n',
  authorizationParams: {
    redirect_uri: window.location.origin
  }
})