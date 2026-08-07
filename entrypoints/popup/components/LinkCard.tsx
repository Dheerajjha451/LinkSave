import { useState } from 'react';
import { type SavedLink } from '@/lib/api';

interface LinkCardProps {
  link: SavedLink;
  onDelete: () => void;
  onOpen: () => void;
  onUpdateTitle?: (newTitle: string) => void;
}

/**
 * Format a relative time string (e.g. "2 hours ago", "just now")
 */
function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Extract domain from URL
 */
function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

/**
 * Get Google favicon service URL as reliable fallback
 */
function getGoogleFavicon(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch {
    return '';
  }
}

/**
 * Get first letter for favicon fallback
 */
function getInitial(url: string): string {
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    return domain[0]?.toUpperCase() || '?';
  } catch {
    return '?';
  }
}

export default function LinkCard({ link, onDelete, onOpen, onUpdateTitle }: LinkCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [titleInput, setTitleInput] = useState(link.title || getDomain(link.url));
  const [favSrc, setFavSrc] = useState(link.faviconUrl || getGoogleFavicon(link.url));
  const [favError, setFavError] = useState(false);

  function handleSaveTitle(e?: React.FormEvent | React.MouseEvent) {
    if (e) e.stopPropagation();
    const trimmed = titleInput.trim();
    if (trimmed && trimmed !== link.title && onUpdateTitle) {
      onUpdateTitle(trimmed);
    }
    setIsEditing(false);
  }

  return (
    <div
      className={`link-card ${isEditing ? 'link-card--editing' : ''}`}
      onClick={isEditing || confirmDelete ? undefined : onOpen}
      title={link.url}
    >
      {/* Favicon */}
      {!favError && favSrc ? (
        <img
          className="link-card__favicon"
          src={favSrc}
          alt=""
          onError={() => {
            const googleFav = getGoogleFavicon(link.url);
            if (favSrc !== googleFav) {
              setFavSrc(googleFav);
            } else {
              setFavError(true);
            }
          }}
        />
      ) : (
        <div className="link-card__favicon-fallback">
          {getInitial(link.url)}
        </div>
      )}

      {/* Content */}
      <div className="link-card__content">
        {isEditing ? (
          <div className="link-card__edit-box" onClick={(e) => e.stopPropagation()}>
            <input
              className="link-card__edit-input"
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveTitle();
                if (e.key === 'Escape') setIsEditing(false);
              }}
              autoFocus
            />
            <button
              className="link-card__edit-save-btn"
              onClick={handleSaveTitle}
              title="Save title"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </button>
          </div>
        ) : (
          <>
            <div className="link-card__title">
              {link.title || getDomain(link.url)}
            </div>
            <div className="link-card__url">{getDomain(link.url)}</div>
            <div className="link-card__time">{timeAgo(link.createdAt)}</div>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="link-card__actions">
        {confirmDelete ? (
          /* Inline Delete Confirmation */
          <div className="link-card__confirm-delete" onClick={(e) => e.stopPropagation()}>
            <span className="link-card__confirm-text">Delete?</span>
            <button
              className="link-card__confirm-btn link-card__confirm-btn--yes"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              Yes
            </button>
            <button
              className="link-card__confirm-btn link-card__confirm-btn--no"
              onClick={(e) => {
                e.stopPropagation();
                setConfirmDelete(false);
              }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <>
            {/* Edit Title */}
            {onUpdateTitle && !isEditing && (
              <button
                className="link-card__edit-toggle"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                title="Edit link title"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  <path d="m15 5 4 4" />
                </svg>
              </button>
            )}

            {/* Copy */}
            <CopyButton url={link.url} />

            {/* Delete button triggering confirmation */}
            <button
              className="link-card__delete"
              onClick={(e) => {
                e.stopPropagation();
                setConfirmDelete(true);
              }}
              title="Delete link"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Copy button with copied state feedback
 */
function CopyButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }

  return (
    <button
      className={`link-card__copy ${copied ? 'link-card__copy--copied' : ''}`}
      onClick={handleCopy}
      title={copied ? 'Copied!' : 'Copy link'}
    >
      {copied ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  );
}
