import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { signOut } from '@/lib/auth';
import { getLinks, saveLink, updateLink, deleteLink, type SavedLink } from '@/lib/api';
import { searchLinks } from '@/lib/search';
import LinkCard from './LinkCard';
import EmptyState from './EmptyState';

const CACHE_KEY = 'linksave_cached_links';

interface DashboardProps {
  user: {
    userId: string;
    email: string;
    name: string;
    picture: string;
  };
  token: string;
  onSignOut: () => void;
}

export default function Dashboard({ user, token, onSignOut }: DashboardProps) {
  // Instant Loading: initialize links state from local cache (0ms latency!)
  const [links, setLinks] = useState<SavedLink[]>(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(() => links.length === 0);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  // Date Filter state
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Manual URL & Custom Name State
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [manualTitle, setManualTitle] = useState('');
  const [savingManual, setSavingManual] = useState(false);
  const urlInputRef = useRef<HTMLInputElement>(null);

  // Helper to persist links to cache
  const updateLinksAndCache = useCallback((updater: SavedLink[] | ((prev: SavedLink[]) => SavedLink[])) => {
    setLinks((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error('Failed to cache links:', e);
      }
      return next;
    });
  }, []);

  // Fetch links on mount (Background revalidation)
  useEffect(() => {
    fetchLinks();
  }, []);

  // Keyboard shortcut: Ctrl/Cmd+K to focus search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === 'Escape') {
        if (search) setSearch('');
        if (startDate || endDate) {
          setStartDate('');
          setEndDate('');
        }
        searchRef.current?.blur();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [search, startDate, endDate]);

  async function fetchLinks() {
    try {
      const data = await getLinks(token);
      updateLinksAndCache(data);
    } catch (err) {
      console.error('Failed to fetch links:', err);
      if (links.length === 0) showToast('Failed to load links');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveCurrentPage() {
    setSaving(true);
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.url) {
        showToast('Could not get current tab URL');
        return;
      }

      const newLink = await saveLink(token, {
        url: tab.url,
        title: tab.title || tab.url,
        faviconUrl: tab.favIconUrl || '',
      });

      updateLinksAndCache((prev) => [newLink, ...prev]);
      setSaveSuccess(true);
      showToast('Link saved!');
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err: any) {
      if (err.message.toLowerCase().includes('already been saved')) {
        showToast('Link already saved');
      } else {
        showToast('Failed to save link');
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveManualUrl() {
    const url = manualUrl.trim();
    if (!url) return;

    const fullUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;

    try {
      new URL(fullUrl);
    } catch {
      showToast('Please enter a valid URL');
      return;
    }

    // Auto-generate Google favicon URL if missing
    let faviconUrl = '';
    try {
      const domain = new URL(fullUrl).hostname;
      faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {
      // ignore
    }

    setSavingManual(true);
    try {
      const titleToSave = manualTitle.trim() || fullUrl;

      const newLink = await saveLink(token, {
        url: fullUrl,
        title: titleToSave,
        faviconUrl,
      });

      updateLinksAndCache((prev) => [newLink, ...prev]);
      setManualUrl('');
      setManualTitle('');
      setShowUrlInput(false);
      showToast('Link saved!');
    } catch (err: any) {
      if (err.message.toLowerCase().includes('already been saved')) {
        showToast('Link already saved');
      } else {
        showToast('Failed to save link');
      }
    } finally {
      setSavingManual(false);
    }
  }

  async function handleUpdateTitle(linkId: string, newTitle: string) {
    try {
      // Optimistic local update
      updateLinksAndCache((prev) =>
        prev.map((l) => (l._id === linkId ? { ...l, title: newTitle } : l))
      );
      await updateLink(token, linkId, { title: newTitle });
      showToast('Title updated');
    } catch (err) {
      showToast('Failed to update title');
      fetchLinks(); // revert on failure
    }
  }

  async function handleDelete(linkId: string) {
    try {
      // Optimistic delete
      updateLinksAndCache((prev) => prev.filter((l) => l._id !== linkId));
      await deleteLink(token, linkId);
      showToast('Link deleted');
    } catch (err) {
      showToast('Failed to delete link');
      fetchLinks();
    }
  }

  async function handleLogout() {
    localStorage.removeItem(CACHE_KEY);
    await signOut();
    onSignOut();
  }

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(''), 2500);
  }

  const handleOpenLink = useCallback((url: string) => {
    chrome.tabs.create({ url });
  }, []);

  // Smart fuzzy search with relevance ranking & date range filter
  const filteredLinks = useMemo(
    () => searchLinks(links, { query: search, startDate, endDate }),
    [links, search, startDate, endDate]
  );

  // Copy All links in view
  async function handleCopyAllLinks() {
    if (filteredLinks.length === 0) return;
    const allUrls = filteredLinks.map((l) => `${l.title}: ${l.url}`).join('\n');
    try {
      await navigator.clipboard.writeText(allUrls);
      showToast(`Copied ${filteredLinks.length} links to clipboard!`);
    } catch {
      showToast('Failed to copy links');
    }
  }

  // Preset Date Helpers
  function setTodayPreset() {
    const todayStr = new Date().toISOString().split('T')[0] ?? '';
    setStartDate(todayStr);
    setEndDate(todayStr);
  }

  function setDaysAgoPreset(days: number) {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setStartDate(start.toISOString().split('T')[0] ?? '');
    setEndDate(end.toISOString().split('T')[0] ?? '');
  }

  function clearDateFilter() {
    setStartDate('');
    setEndDate('');
  }

  const hasDateFilter = Boolean(startDate || endDate);

  return (
    <div className="dashboard fade-in">
      {/* Header */}
      <div className="dashboard__header">
        {user.picture ? (
          <img
            className="dashboard__avatar"
            src={user.picture}
            alt={user.name}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="dashboard__avatar-fallback">
            {(user.name || user.email || '?').charAt(0).toUpperCase()}
          </div>
        )}

        <div className="dashboard__user-info">
          <div className="dashboard__user-name">{user.name || 'User'}</div>
          <div className="dashboard__user-email">{user.email}</div>
        </div>

        <button
          className="dashboard__logout-btn"
          onClick={handleLogout}
          title="Sign out"
          id="logout-btn"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>

      {/* Save Bar */}
      <div className="dashboard__save-bar">
        <button
          className={`dashboard__save-btn ${saveSuccess ? 'dashboard__save-btn--success' : ''}`}
          onClick={handleSaveCurrentPage}
          disabled={saving}
          id="save-current-page-btn"
        >
          {saving ? (
            <div className="spinner" />
          ) : saveSuccess ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          )}
          {saving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Current Page'}
        </button>

        {/* Toggle manual URL input */}
        <button
          className={`dashboard__add-url-toggle ${showUrlInput ? 'dashboard__add-url-toggle--active' : ''}`}
          onClick={() => {
            setShowUrlInput(!showUrlInput);
            if (!showUrlInput) {
              setTimeout(() => urlInputRef.current?.focus(), 100);
            }
          }}
          title="Add a link manually with custom name"
          id="add-url-toggle-btn"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        </button>
      </div>

      {/* Manual URL & Custom Name Input Bar */}
      {showUrlInput && (
        <div className="dashboard__url-input-bar fade-in">
          <div className="dashboard__manual-fields">
            <input
              ref={urlInputRef}
              className="dashboard__url-input"
              type="url"
              placeholder="URL (e.g. https://github.com)"
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              id="manual-url-input"
            />
            <input
              className="dashboard__title-input"
              type="text"
              placeholder="Custom Name / Title (Optional)"
              value={manualTitle}
              onChange={(e) => setManualTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveManualUrl();
                if (e.key === 'Escape') {
                  setShowUrlInput(false);
                  setManualUrl('');
                  setManualTitle('');
                }
              }}
              id="manual-title-input"
            />
          </div>
          <button
            className="dashboard__url-save-btn"
            onClick={handleSaveManualUrl}
            disabled={savingManual || !manualUrl.trim()}
            id="save-manual-url-btn"
            title="Save Link"
          >
            {savingManual ? (
              <div className="spinner" />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            )}
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      {links.length > 0 && (
        <div className="dashboard__search">
          <div className="dashboard__search-input-wrapper">
            <svg className="dashboard__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={searchRef}
              className="dashboard__search-input"
              type="text"
              placeholder="Search by title, URL, domain..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="search-input"
            />
            {search && (
              <button
                className="dashboard__search-clear"
                onClick={() => setSearch('')}
                title="Clear search (Esc)"
                id="search-clear-btn"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}

            {/* Toggle Date Filter */}
            <button
              className={`dashboard__date-filter-toggle ${showDateFilter || hasDateFilter ? 'dashboard__date-filter-toggle--active' : ''}`}
              onClick={() => setShowDateFilter(!showDateFilter)}
              title="Filter links by date"
              id="date-filter-toggle-btn"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {hasDateFilter && <span className="dashboard__date-filter-indicator" />}
            </button>
          </div>

          {/* Date Filter Panel */}
          {(showDateFilter || hasDateFilter) && (
            <div className="dashboard__date-panel fade-in">
              <div className="dashboard__date-presets">
                <button
                  className="dashboard__preset-btn"
                  onClick={setTodayPreset}
                >
                  Today
                </button>
                <button
                  className="dashboard__preset-btn"
                  onClick={() => setDaysAgoPreset(7)}
                >
                  Last 7d
                </button>
                <button
                  className="dashboard__preset-btn"
                  onClick={() => setDaysAgoPreset(30)}
                >
                  Last 30d
                </button>
                {hasDateFilter && (
                  <button
                    className="dashboard__preset-btn dashboard__preset-btn--clear"
                    onClick={clearDateFilter}
                  >
                    Clear dates
                  </button>
                )}
              </div>

              <div className="dashboard__date-inputs">
                <div className="dashboard__date-field">
                  <label htmlFor="start-date">From</label>
                  <input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="dashboard__date-field">
                  <label htmlFor="end-date">To</label>
                  <input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Links List */}
      <div className="dashboard__links">
        {loading && links.length === 0 ? (
          <div className="loading-screen" style={{ height: 'auto', padding: '48px 0' }}>
            <div className="spinner spinner--dark" />
            <span className="loading-screen__text">Loading links...</span>
          </div>
        ) : links.length === 0 ? (
          <EmptyState />
        ) : filteredLinks.length === 0 ? (
          <EmptyState
            title="No matches found"
            text={
              hasDateFilter
                ? `No links match your search or date criteria (${startDate || 'start'} to ${endDate || 'end'}).`
                : `No links match "${search}". Try different keywords.`
            }
          />
        ) : (
          <>
            <div className="dashboard__links-header">
              <span className="dashboard__links-count">
                {filteredLinks.length} {filteredLinks.length === 1 ? 'link' : 'links'}
                {(search || hasDateFilter) && ` found`}
              </span>
              <button
                className="dashboard__copy-all-btn"
                onClick={handleCopyAllLinks}
                title="Copy all links in list to clipboard"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy All
              </button>
            </div>
            {filteredLinks.map((link) => (
              <LinkCard
                key={link._id}
                link={link}
                onDelete={() => handleDelete(link._id)}
                onOpen={() => handleOpenLink(link.url)}
                onUpdateTitle={(newTitle) => handleUpdateTitle(link._id, newTitle)}
              />
            ))}
          </>
        )}
      </div>

      {/* Toast */}
      {toast && <div className="dashboard__toast">{toast}</div>}
    </div>
  );
}
