'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Calendar,
  Copy,
  Trash2,
  Edit2,
  Check,
  X,
  Sparkles,
  Link as LinkIcon,
  LogOut,
} from 'lucide-react';

interface SavedLinkItem {
  id: string;
  url: string;
  title: string;
  domain: string;
  faviconUrl: string;
  timeAgo: string;
  dateStr: string; // YYYY-MM-DD
}

const initialDemoLinks: SavedLinkItem[] = [
  {
    id: '1',
    url: 'https://chromewebstore.google.com/detail/linksave/ojikdodfhnpohghabhaebmkglmpagenm',
    title: 'LinkSave - Chrome Web Store',
    domain: 'chromewebstore.google.com',
    faviconUrl: 'https://www.google.com/s2/favicons?domain=chromewebstore.google.com&sz=64',
    timeAgo: '3d ago',
    dateStr: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0] ?? '2026-08-08',
  },
  {
    id: '2',
    url: 'https://www.dheerajjha.com/',
    title: 'Home | Dheeraj Jha',
    domain: 'dheerajjha.com',
    faviconUrl: 'https://www.google.com/s2/favicons?domain=dheerajjha.com&sz=64',
    timeAgo: '3d ago',
    dateStr: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0] ?? '2026-08-08',
  },
  {
    id: '3',
    url: 'https://webannotates.com/',
    title: 'WebAnnotate — AI Web Annotation & Insights',
    domain: 'webannotates.com',
    faviconUrl: 'https://www.google.com/s2/favicons?domain=webannotates.com&sz=64',
    timeAgo: '3d ago',
    dateStr: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0] ?? '2026-08-08',
  },
];

export default function InteractiveDemo() {
  const [links, setLinks] = useState<SavedLinkItem[]>(initialDemoLinks);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');

  // Manual Link Input State
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [manualTitle, setManualTitle] = useState('');

  // Date Filter State
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Title Editing & Hovered Tooltip State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [hoveredLinkId, setHoveredLinkId] = useState<string | null>(null);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

  // Save current page simulation state
  const [savingCurrent, setSavingCurrent] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const showToastMsg = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  };

  const handleSaveCurrentPage = () => {
    setSavingCurrent(true);
    setTimeout(() => {
      const currentUrl = typeof window !== 'undefined' ? window.location.href : 'http://localhost:3000';
      const currentTitle = typeof document !== 'undefined' && document.title ? document.title : 'LinkSave — Personal Link Library';
      let domainStr = 'localhost';
      try {
        domainStr = new URL(currentUrl).hostname.replace('www.', '');
      } catch (err) {
        console.warn('Could not parse URL hostname, using fallback domain:', err);
      }

      const newLink: SavedLinkItem = {
        id: Date.now().toString(),
        url: currentUrl,
        title: currentTitle,
        domain: domainStr,
        faviconUrl: `https://www.google.com/s2/favicons?domain=${domainStr}&sz=64`,
        timeAgo: 'Just now',
        dateStr: new Date().toISOString().split('T')[0] ?? '2026-08-11',
      };

      setLinks((prev) => [newLink, ...prev]);
      setSavingCurrent(false);
      setSaveSuccess(true);
      showToastMsg('Saved current page URL!');
      setTimeout(() => setSaveSuccess(false), 2000);
    }, 400);
  };

  const handleSaveManualUrl = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const url = manualUrl.trim();
    if (!url) return;

    const fullUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    let domainStr = 'example.com';
    try {
      domainStr = new URL(fullUrl).hostname.replace('www.', '');
    } catch {
      showToastMsg('Please enter a valid URL');
      return;
    }

    const titleToSave = manualTitle.trim() || fullUrl;
    const newLink: SavedLinkItem = {
      id: Date.now().toString(),
      url: fullUrl,
      title: titleToSave,
      domain: domainStr,
      faviconUrl: `https://www.google.com/s2/favicons?domain=${domainStr}&sz=64`,
      timeAgo: 'Just now',
      dateStr: new Date().toISOString().split('T')[0] ?? '2026-08-11',
    };

    setLinks((prev) => [newLink, ...prev]);
    setManualUrl('');
    setManualTitle('');
    setShowUrlInput(false);
    showToastMsg('Link saved!');
  };

  const handleSaveTitleUpdate = (id: string) => {
    if (!editingTitle.trim()) return;
    setLinks((prev) =>
      prev.map((l) => (l.id === id ? { ...l, title: editingTitle.trim() } : l))
    );
    setEditingId(null);
    showToastMsg('Title updated');
  };

  const handleCopySingleUrl = async (id: string, url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLinkId(id);
      showToastMsg('Link copied to clipboard!');
      setTimeout(() => setCopiedLinkId(null), 1500);
    } catch {
      showToastMsg('Failed to copy');
    }
  };

  const handleDeleteLink = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLinks((prev) => prev.filter((l) => l.id !== id));
    showToastMsg('Link deleted');
  };

  const handleCopyAll = async () => {
    const text = filteredLinks.map((l) => `${l.title}: ${l.url}`).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      showToastMsg(`Copied ${filteredLinks.length} links!`);
    } catch {
      showToastMsg('Failed to copy');
    }
  };

  const filteredLinks = useMemo(() => {
    return links.filter((link) => {
      const query = search.toLowerCase().trim();
      const matchesSearch =
        !query ||
        link.title.toLowerCase().includes(query) ||
        link.url.toLowerCase().includes(query) ||
        link.domain.toLowerCase().includes(query);

      const matchesStart = !startDate || link.dateStr >= startDate;
      const matchesEnd = !endDate || link.dateStr <= endDate;

      return matchesSearch && matchesStart && matchesEnd;
    });
  }, [links, search, startDate, endDate]);

  const hasDateFilter = Boolean(startDate || endDate);

  return (
    <section className="section-wrapper">
      <div className="section-header section-header--center">
        <div className="section-tag">
          <Sparkles size={13} />
          <span>Interactive Browser Sandbox</span>
        </div>
        <h2 className="section-title">
          Try LinkSave right in your browser.
        </h2>
        <p className="section-description">
          Add a link below to simulate how LinkSave captures and organizes your links instantly.
        </p>
      </div>

      {/* Simulated Chrome Extension Popup Window (Light Whitish Background) */}
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          margin: '0 auto',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          background: '#ffffff',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          overflow: 'hidden',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          color: '#0f172a',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: '#8b5cf6',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 600,
                color: '#ffffff',
                fontSize: '16px',
              }}
            >
              U
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
                User
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                user@gmail.com
              </div>
            </div>
          </div>
          <button
            onClick={() => showToastMsg('Signed out')}
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
            title="Sign out"
          >
            <LogOut size={18} />
          </button>
        </div>

        {/* Save Bar */}
        <div style={{ padding: '0 16px 14px', display: 'flex', gap: '8px' }}>
          <button
            onClick={handleSaveCurrentPage}
            disabled={savingCurrent}
            style={{
              flex: 1,
              height: '42px',
              borderRadius: '8px',
              border: 'none',
              background: saveSuccess ? '#10b981' : '#0f172a',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'background 0.2s ease',
            }}
          >
            {savingCurrent ? (
              <span>Saving...</span>
            ) : saveSuccess ? (
              <>
                <Check size={16} /> <span>Saved!</span>
              </>
            ) : (
              <>
                <Plus size={16} /> <span>Save Current Page</span>
              </>
            )}
          </button>

          <button
            onClick={() => setShowUrlInput(!showUrlInput)}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              border: showUrlInput ? '1px solid #3b82f6' : '1px solid #e2e8f0',
              background: showUrlInput ? '#eff6ff' : '#f1f5f9',
              color: showUrlInput ? '#3b82f6' : '#0f172a',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
            }}
            title="Add link manually"
          >
            <LinkIcon size={18} />
          </button>
        </div>

        {/* Manual URL Input Panel */}
        <AnimatePresence>
          {showUrlInput && (
            <motion.form
              onSubmit={handleSaveManualUrl}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ padding: '0 16px 14px', overflow: 'hidden' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <input
                  type="url"
                  placeholder="URL (e.g. https://github.com)"
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                  style={{
                    height: '36px',
                    padding: '0 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#0f172a',
                    fontSize: '12px',
                    outline: 'none',
                  }}
                />
                <input
                  type="text"
                  placeholder="Custom Name / Title (Optional)"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  style={{
                    height: '36px',
                    padding: '0 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#0f172a',
                    fontSize: '12px',
                    outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  disabled={!manualUrl.trim()}
                  style={{
                    height: '34px',
                    background: '#0f172a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 600,
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  Save Link
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Search Bar & Date Filter Button */}
        <div style={{ padding: '0 16px 14px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                height: '40px',
                padding: '0 12px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
              }}
            >
              <Search size={16} style={{ color: '#64748b' }} />
              <input
                type="text"
                placeholder="Search by title, URL, domain..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  color: '#0f172a',
                  fontSize: '13px',
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowDateFilter(!showDateFilter)}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                border: showDateFilter || hasDateFilter ? '1px solid #3b82f6' : '1px solid #cbd5e1',
                background: showDateFilter || hasDateFilter ? '#eff6ff' : '#ffffff',
                color: showDateFilter || hasDateFilter ? '#3b82f6' : '#64748b',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              title="Filter links by date"
            >
              <Calendar size={18} />
            </button>
          </div>

          {/* Date Filter Panel */}
          {showDateFilter && (
            <div
              style={{
                marginTop: '8px',
                padding: '12px',
                borderRadius: '8px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                fontSize: '12px',
              }}
            >
              <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                <button
                  onClick={() => {
                    const today = new Date().toISOString().split('T')[0] ?? '';
                    setStartDate(today);
                    setEndDate(today);
                  }}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    background: '#f1f5f9',
                    color: '#334155',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Today
                </button>
                <button
                  onClick={() => {
                    const end = new Date();
                    const start = new Date();
                    start.setDate(end.getDate() - 7);
                    setStartDate(start.toISOString().split('T')[0] ?? '');
                    setEndDate(end.toISOString().split('T')[0] ?? '');
                  }}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    background: '#f1f5f9',
                    color: '#334155',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Last 7d
                </button>
                <button
                  onClick={() => {
                    const end = new Date();
                    const start = new Date();
                    start.setDate(end.getDate() - 30);
                    setStartDate(start.toISOString().split('T')[0] ?? '');
                    setEndDate(end.toISOString().split('T')[0] ?? '');
                  }}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    background: '#f1f5f9',
                    color: '#334155',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Last 30d
                </button>
                {hasDateFilter && (
                  <button
                    onClick={() => {
                      setStartDate('');
                      setEndDate('');
                    }}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      background: 'none',
                      color: '#ef4444',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>FROM</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{
                    flex: 1,
                    height: '34px',
                    background: '#ffffff',
                    backgroundColor: '#ffffff',
                    color: '#0f172a',
                    colorScheme: 'light',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '12px',
                    padding: '0 8px',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                />
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>TO</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{
                    flex: 1,
                    height: '34px',
                    background: '#ffffff',
                    backgroundColor: '#ffffff',
                    color: '#0f172a',
                    colorScheme: 'light',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '12px',
                    padding: '0 8px',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Links Count & Copy All Bar */}
        <div
          style={{
            padding: '0 16px 10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em', color: '#64748b', textTransform: 'uppercase' }}>
            {filteredLinks.length} LINKS
          </span>
          <button
            onClick={handleCopyAll}
            style={{
              background: 'none',
              border: 'none',
              color: '#3b82f6',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            <Copy size={14} />
            <span>Copy All</span>
          </button>
        </div>

        {/* Saved Links Cards List (Exact Extension Popup Layout with Hover Actions & Tooltip) */}
        <div style={{ padding: '0 16px 16px', maxHeight: '380px', overflowY: 'auto' }}>
          <AnimatePresence>
            {filteredLinks.map((link) => {
              const isEditing = editingId === link.id;
              const isHovered = hoveredLinkId === link.id;
              const isCopied = copiedLinkId === link.id;

              return (
                <motion.div
                  key={link.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onMouseEnter={() => setHoveredLinkId(link.id)}
                  onMouseLeave={() => setHoveredLinkId(null)}
                  onClick={() => {
                    if (!isEditing) window.open(link.url, '_blank');
                  }}
                  style={{
                    position: 'relative',
                    padding: '14px 16px',
                    marginBottom: '10px',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '12px',
                    cursor: isEditing ? 'default' : 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', overflow: 'hidden', flex: 1 }}>
                    {/* White Favicon Container */}
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '8px',
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      }}
                    >
                      <img
                        src={link.faviconUrl}
                        alt=""
                        style={{ width: '20px', height: '20px', borderRadius: '3px' }}
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>

                    {isEditing ? (
                      <div
                        style={{ display: 'flex', gap: '4px', flex: 1, marginTop: '2px' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveTitleUpdate(link.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          style={{
                            flex: 1,
                            background: '#ffffff',
                            border: '1px solid #3b82f6',
                            borderRadius: '6px',
                            color: '#0f172a',
                            fontSize: '13px',
                            padding: '4px 8px',
                            outline: 'none',
                          }}
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveTitleUpdate(link.id)}
                          style={{ background: '#10b981', border: 'none', borderRadius: '6px', color: '#ffffff', cursor: 'pointer', padding: '0 8px' }}
                        >
                          <Check size={14} />
                        </button>
                      </div>
                    ) : (
                      <div style={{ overflow: 'hidden' }}>
                        <div
                          style={{
                            fontSize: '14px',
                            fontWeight: 700,
                            color: '#0f172a',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            lineHeight: 1.3,
                          }}
                        >
                          {link.title}
                        </div>
                        <div
                          style={{
                            fontSize: '12px',
                            color: '#64748b',
                            marginTop: '2px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {link.domain}
                        </div>
                        <div
                          style={{
                            fontSize: '11px',
                            color: '#94a3b8',
                            marginTop: '3px',
                          }}
                        >
                          {link.timeAgo}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Top-Right Actions (Pencil / Copy / Trash) shown on hover or active */}
                  {!isEditing && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        opacity: isHovered || isCopied ? 1 : 0.6,
                        transition: 'opacity 0.2s ease',
                      }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingId(link.id);
                          setEditingTitle(link.title);
                        }}
                        style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
                        title="Edit title"
                      >
                        <Edit2 size={15} />
                      </button>

                      <button
                        onClick={(e) => handleCopySingleUrl(link.id, link.url, e)}
                        style={{ background: 'none', border: 'none', color: isCopied ? '#10b981' : '#64748b', cursor: 'pointer', padding: '4px' }}
                        title="Copy link URL"
                      >
                        {isCopied ? <Check size={15} /> : <Copy size={15} />}
                      </button>

                      <button
                        onClick={(e) => handleDeleteLink(link.id, e)}
                        style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
                        title="Delete link"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}

                  {/* Hover URL Tooltip Popup (Exactly matching the screenshot black URL tag!) */}
                  {isHovered && !isEditing && (
                    <div
                      style={{
                        position: 'absolute',
                        right: '12px',
                        bottom: '-12px',
                        background: '#0f172a',
                        color: '#ffffff',
                        fontSize: '11px',
                        fontFamily: 'monospace',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        zIndex: 10,
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none',
                      }}
                    >
                      {link.url}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Toast Notification */}
        {toast && (
          <div
            style={{
              padding: '8px 12px',
              background: '#eff6ff',
              borderTop: '1px solid #bfdbfe',
              color: '#1d4ed8',
              fontSize: '12px',
              fontWeight: 500,
              textAlign: 'center',
            }}
          >
            {toast}
          </div>
        )}
      </div>
    </section>
  );
}
