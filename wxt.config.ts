import { defineConfig } from 'wxt';
import { loadEnv } from 'vite';

const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';
const env = loadEnv(mode, process.cwd(), '');
const googleOAuthClientId = env.GOOGLE_OAUTH_CLIENT_ID;

if (!googleOAuthClientId) {
  throw new Error('GOOGLE_OAUTH_CLIENT_ID must be set in .env.local before building LinkSave.');
}

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'LinkSave',
    description: 'Save and organize your favorite links. Private to you, accessible anywhere.',
    version: '1.1.1',
    permissions: [
      'identity',
      'activeTab',
      'contextMenus',
      'storage',
      'notifications',
    ],
    oauth2: {
      client_id: googleOAuthClientId,
      scopes: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
      ],
    },
    // Required for chrome.identity to work
    key: undefined,
  },
});
