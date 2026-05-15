(function () {
  const STORAGE_PREFIX = 'lsl.googleAuth';
  const EXPIRY_BUFFER_MS = 2 * 60 * 1000;

  function storageKey(clientId, scope) {
    return `${STORAGE_PREFIX}:${clientId}:${scope}`;
  }

  function getSessionStorage() {
    try {
      return window.sessionStorage;
    } catch {
      return null;
    }
  }

  function readToken(clientId, scope) {
    const storage = getSessionStorage();
    if (!storage) return null;

    const key = storageKey(clientId, scope);
    try {
      const cached = JSON.parse(storage.getItem(key) || 'null');
      if (!cached?.accessToken || !cached?.expiresAt) return null;
      if (Date.now() + EXPIRY_BUFFER_MS >= cached.expiresAt) {
        storage.removeItem(key);
        return null;
      }
      return cached.accessToken;
    } catch {
      storage.removeItem(key);
      return null;
    }
  }

  function writeToken(clientId, scope, tokenResponse) {
    const storage = getSessionStorage();
    if (!storage || !tokenResponse?.access_token) return;

    const expiresIn = Number(tokenResponse.expires_in || 3600);
    const expiresAt = Date.now() + Math.max(expiresIn, 0) * 1000;
    try {
      storage.setItem(storageKey(clientId, scope), JSON.stringify({
        accessToken: tokenResponse.access_token,
        expiresAt
      }));
    } catch {
      clearToken(clientId, scope);
    }
  }

  function clearToken(clientId, scope) {
    const storage = getSessionStorage();
    if (!storage) return;
    storage.removeItem(storageKey(clientId, scope));
  }

  window.LSLAuth = {
    readToken,
    writeToken,
    clearToken
  };
})();
