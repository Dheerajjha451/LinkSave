import { useState, useEffect, useRef } from 'react';
import {
  cacheUserInfo,
  clearCachedUserInfo,
  getAuthTokenSilent,
  getCachedUserInfo,
  getUserInfo,
} from '@/lib/auth';
import SignIn from './components/SignIn';
import Dashboard from './components/Dashboard';
import './App.css';

interface UserInfo {
  userId: string;
  email: string;
  name: string;
  picture: string;
}

function App() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const authCheckStarted = useRef(false);

  // Check for existing auth on mount
  useEffect(() => {
    // React Strict Mode re-runs effects in development. Do this only once so
    // opening the popup does not trigger duplicate identity and API requests.
    if (authCheckStarted.current) return;
    authCheckStarted.current = true;
    void checkAuth();
  }, []);

  async function checkAuth() {
    try {
      // Chrome returns the token locally. The profile cache removes a network
      // round trip from the normal popup-open path.
      const [existingToken, cachedUser] = await Promise.all([
        getAuthTokenSilent(),
        getCachedUserInfo(),
      ]);

      if (!existingToken) {
        await clearCachedUserInfo();
        return;
      }

      if (cachedUser) {
        setToken(existingToken);
        setUser(cachedUser);
        void refreshUserInfo(existingToken);
        return;
      }

      const userInfo = await getUserInfo(existingToken);
      if (userInfo) {
        setToken(existingToken);
        setUser(userInfo);
        void cacheUserInfo(userInfo);
      }
    } catch (e) {
      // No existing session, user needs to sign in
    } finally {
      setLoading(false);
    }
  }

  async function refreshUserInfo(existingToken: string) {
    const freshUser = await getUserInfo(existingToken);
    if (!freshUser) return;
    setUser(freshUser);
    void cacheUserInfo(freshUser);
  }

  function handleSignIn(authToken: string, userInfo: UserInfo) {
    setToken(authToken);
    setUser(userInfo);
    void cacheUserInfo(userInfo);
  }

  function handleSignOut() {
    setToken(null);
    setUser(null);
    void clearCachedUserInfo();
  }

  if (loading) {
    return (
      <div className="app">
        <div className="loading-screen">
          <div className="spinner spinner--dark" />
          <span className="loading-screen__text">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {!user || !token ? (
        <SignIn onSignIn={handleSignIn} />
      ) : (
        <Dashboard user={user} token={token} onSignOut={handleSignOut} />
      )}
    </div>
  );
}

export default App;
