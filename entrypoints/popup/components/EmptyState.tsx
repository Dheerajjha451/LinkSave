interface EmptyStateProps {
  title?: string;
  text?: string;
}

export default function EmptyState({
  title = 'No links saved yet',
  text = 'Click "Save Current Page" to save the page you\'re currently viewing.',
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="19" cy="19" r="4.5" fill="#3b82f6" stroke="currentColor" strokeWidth="0.5"/>
          <line x1="19" y1="17" x2="19" y2="21" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="17" y1="19" x2="21" y2="19" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__text">{text}</p>
    </div>
  );
}
