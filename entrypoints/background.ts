import { API_BASE } from '@/lib/config';
import { getApiErrorMessage } from '@/lib/api';

export default defineBackground(() => {
  // Create context menu on install
  browser.runtime.onInstalled.addListener(() => {
    browser.contextMenus.create({
      id: 'save-to-linksave',
      title: 'Save to LinkSave',
      contexts: ['page', 'link'],
    });
  });

  // Handle context menu clicks
  browser.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId !== 'save-to-linksave') return;

    try {
      // Get auth token silently
      const token = await new Promise<string>((resolve, reject) => {
        chrome.identity.getAuthToken({ interactive: false }, (token) => {
          if (chrome.runtime.lastError || !token) {
            reject(new Error('Not signed in'));
            return;
          }
          resolve(token);
        });
      });

      // Determine what URL to save
      const url = info.linkUrl || info.pageUrl || tab?.url;
      const title = info.linkUrl ? info.linkUrl : tab?.title || '';
      const faviconUrl = tab?.favIconUrl || '';

      if (!url) {
        throw new Error('No URL to save');
      }

      // Save to backend
      const res = await fetch(`${API_BASE}/links`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, title, faviconUrl }),
      });

      if (!res.ok) {
        if (res.status === 409) {
          // Link already saved — not an error
          showNotification('Already Saved', 'This link is already in your collection.');
          return;
        }
        throw new Error(await getApiErrorMessage(res));
      }

      showNotification('Link Saved!', `Saved: ${title || url}`);
    } catch (error: any) {
      if (error.message === 'Not signed in') {
        showNotification('Sign In Required', 'Open LinkSave popup and sign in first.');
      } else {
        showNotification('Save Failed', error.message || 'Could not save the link.');
      }
    }
  });

  function showNotification(title: string, message: string) {
    browser.notifications.create({
      type: 'basic',
      iconUrl: browser.runtime.getURL('/icon/128.png'),
      title,
      message,
    });
  }
});
