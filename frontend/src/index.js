import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { Auth0Provider } from '@auth0/auth0-react';
import './App.css';

const domain = process.env.REACT_APP_AUTH0_DOMAIN;
const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID;
const audience = process.env.REACT_APP_AUTH0_AUDIENCE;
const redirectUri = process.env.REACT_APP_AUTH0_REDIRECT_URI;

createRoot(document.getElementById('root')).render(
  <Auth0Provider
    domain={domain}
    clientId={clientId}
    authorizationParams={{
      redirect_uri: redirectUri,
      audience: audience,
    }}
  >
    <App />
  </Auth0Provider>
);
